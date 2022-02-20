import { fetch } from 'undici';

export interface IAnswer {
    question: string;
    answer: string;
    correct: boolean;
    correctAnswer: string;
}


function toSnakeCase(input:string){
    return input.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

export async function getConceptsFromWikidata(topics:IAnswer[]){

    const response = {
        skipped: [] as string[],
        idMappings: {} as Record<string, {
            id: string;
            correct: boolean;
        }>,
        concepts: {} as Record<string, string[]>
    }

    
    //Get all the wikidata ids for the topics
    const topicLookups = topics.map(t=>{
        return{
        topic: t.correctAnswer,
        correct: t.correct,
        url: `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${toSnakeCase(t.answer)}&language=en&format=json&limit=1`
        }
    })
    for(const url of topicLookups){
        console.log(url.url + " is being fetched");
        try{
            const conceptData = await (await fetch(url.url)).json() as Record<string, any>;
            const id = conceptData.search[0].id;
            response.idMappings[url.topic] = {
                id: id,
                correct: url.correct
            };
        } catch(e){
            response.skipped.push(url.topic);
        }
        //Wait 50ms
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const topicsWithProperties = {} as Record<string, Record<string,string[]|boolean>>;

    //Query properties for each wikidata id 
    for(const [topicName,topic] of Object.entries(response.idMappings)){
        const queryURL = `https://query.wikidata.org/sparql?query=SELECT%20%3FwdLabel%20%3Fps_Label%20%3FwdpqLabel%20%3Fpq_Label%20%7B%0A%20%20VALUES%20(%3Fcompany)%20%7B(wd%3A${topic.id})%7D%0A%20%20%0A%20%20%3Fcompany%20%3Fp%20%3Fstatement%20.%0A%20%20%3Fstatement%20%3Fps%20%3Fps_%20.%0A%20%20%0A%20%20%3Fwd%20wikibase%3Aclaim%20%3Fp.%0A%20%20%3Fwd%20wikibase%3AstatementProperty%20%3Fps.%0A%20%20%0A%20%20OPTIONAL%20%7B%0A%20%20%3Fstatement%20%3Fpq%20%3Fpq_%20.%0A%20%20%3Fwdpq%20wikibase%3Aqualifier%20%3Fpq%20.%0A%20%20%7D%0A%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20%7D%0A%7D%20ORDER%20BY%20%3Fwd%20%3Fstatement%20%3Fps_&format=json`
        console.log(queryURL + " is being fetched");
        try{
            const conceptData = await (await fetch(queryURL)).json() as Record<string, any>;
            const statements = conceptData.results.bindings;
            const entries = statements.map((statement:any) => {
                const property = statement.wdLabel.value;
                const value = statement.ps_Label.value;

                return{
                    property,
                    value
                }
            }).reduce((acc:any, curr:any) => {
                if(curr.property.split(" ").reverse()[0]==="ID") return acc;
                if(!acc[curr.property]){
                    acc[curr.property] = [];
                }
                //Ignore if already in the list
                if(acc[curr.property].includes(curr.value)) return acc;
                
                acc[curr.property].push(curr.value)
                return acc;
            }, {} as Record<string, string[]>);

            topicsWithProperties[topicName] = {...entries,correct:topic.correct};
        } catch(e){
            response.skipped.push(topic.id);
        }
        //Wait 50ms
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    return filterWikiConcepts(topicsWithProperties);
        
}

// Return object of {[question_topic: {keywords: [keywords], image: https://img}, ...]}
// {Communism: [economic system, political ideology], Red Scare: [incident, fear]}
export function filterWikiConcepts(concepts:{
    [key:string]: any
}) {
    const parents: {
        [key:string]: any
    } = {}
    for (const topic in concepts) {
        if (topic == 'topicsRanked') continue
        concepts[topic].parents = getParentTopicKeywords(concepts[topic])
    }
    return concepts;
}

// Generates [...keywords] for each question_topic
export function getParentTopicKeywords(topics:{
    [key:string]: any
}) {
    let keywords:string[] = []
    const keys: string[] = []
    for (const key in topics) {
        //console.log(`Key: ${key}`)
        if (key.toLowerCase().includes("instance") || key.toLowerCase().includes("subclass") || key.toLowerCase().includes("category") || key.toLowerCase().includes("effect") || key.toLowerCase().includes("part")) {
            keys.push(key)
        }
    }
    for (const key of keys) {
        if(!Array.isArray(topics[key])) continue;
        keywords.push(...topics[key])
    }
    keywords = keywords.map(r=>r.toLowerCase())
    // Remove duplicates
    keywords = [...new Set(keywords)]
    // Get rid of Prefixes :
    keywords = keywords.filter(x => x.split(":").length === 1)
    // console.log(keywords)
    // const ret = {
    //     keywords: keywords
    // }
    // if (topics.keys.includes("image")) {
    //     ret["image"] = topics.image
    // }
    // return ret
    return keywords
}

// Potentially limit to only parents; do tmrw
export function rankAnswers(topicsWithProps: Record<string, Record<string,string[]|boolean>>){
    const response = {
        mainTopics: topicsWithProps,
        topicsRanked: [] as {
            topic: string,
            score: number,
            belongsTo: string[]
        }[]
    }

    Object.entries(topicsWithProps).forEach(([topicName,a])=>{
        const isCorrect = a.correct;
        Object.entries(a).forEach(([key,subTopics])=>{
            if(typeof subTopics === "boolean") return;
            
            subTopics.forEach(subTopic=>{
                //Filters 
                if(subTopic.split(":").length > 1) return;
                if(subTopic.toLowerCase().includes("http://")) return;
                if(subTopic.toLowerCase().includes("https://")) return;
                if(!isNaN(subTopic as any)) return;
                
                if(!response.topicsRanked.find(t=>t.topic===subTopic)){
                    response.topicsRanked.push({
                        topic: subTopic,
                        score: 0,
                        belongsTo:[] as string[]
                    })
                }
                
                const subTopicIndex = response.topicsRanked.findIndex(t=>t.topic===subTopic);
                response.topicsRanked[subTopicIndex].score += isCorrect ? 1 : -2;
                //Skip if already in the list
                if(response.topicsRanked[subTopicIndex].belongsTo.includes(topicName)) return;
                response.topicsRanked[subTopicIndex].belongsTo.push(topicName);
            })
        })
    })


    response.topicsRanked = response.topicsRanked.sort((a,b)=>{
        return a.score - b.score;
    })
    
        

    return response;
}
/*{
    mainTopics: topicsWithProps,
    topicsRanked: [] as {
        topic: string,
        score: number,
        belongsTo: string[],
        image: string,
        audio: string,
        video: string,
        summary: string
    }[]
}*/
export async function analyze(answers:IAnswer[]){
    const wikidata = await getConceptsFromWikidata(answers);
    /*
    const response = {
        skipped: [] as string[],
        idMappings: {} as Record<string, {
            id: string;
            correct: boolean;
        }>,
        concepts: {} as Record<string, string[]>
    }
    */
    const ranked = rankAnswers(wikidata);
    /*
    const response = {
        mainTopics: topicsWithProps,
        topicsRanked: [] as {
            topic: string,
            score: number,
            belongsTo: string[]
        }[]
    }
    */
   // Populate a topic (Stalin) to image array
    const questionsToImages: {
        [key:string]: any
    } = {}
    for (const key in wikidata.concepts) {
        if (wikidata.concepts.keys.includes("image"))
        questionsToImages[key] = wikidata.concepts.image[0]
        break
    }

    // Get audio
    const questionsToAudio: {
        [key:string]: any
    } = {}
    for (const key in wikidata.concepts) {
        if (wikidata.concepts.keys.includes("audio")) {
            questionsToAudio[key] = wikidata.concepts.image[0]
            break
        }
    }


    // For each subtopic (moustache), loop through their belongsTo and find something that has an image in questionsToImages
    ranked.topicsRanked.forEach(topic => {

        for (const question in topic.belongsTo) { // For each quesition (Stalin) in topic (moustache)
            if (questionsToImages.keys && questionsToImages.keys.includes(question)) { // If Stalin has an image
                topic["image"] =  questionsToImages[question]
                break
            }
        }
        for (const question in topic.belongsTo) {
            if (questionsToAudio.keys && questionsToAudio.keys.includes(question)) {
                topic["audio"] = questionsToAudio[question]
                break
            }
        }

    });    

    

    return ranked; 
}

export function getDisplayInformation() {
    
}
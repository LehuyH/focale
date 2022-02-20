const { v4: uuidv4 } = require('uuid')

//Import concepts.json
const dataParsed = require('./concepts.json')

// {id:uniqueNumber, label: 'Name', image: 'If there is one', title: 'Name', size: '60 is max'}
// {'from':topic, 'to':instanceOfTopic, 'length':100, 'title':'whaterver','arrows':'to'}
function toGraph(data) {
    const nodes = []
    const edges = []
    const ideas = data.topicsRanked
        // Stalin, Communism = questions
        // Economics, moustache = ideas
    const questions = data.mainTopics
    const questionNodeIDs = {}
    const questionData = {}

    //Create nodes for questions
    for (const q in questions) {
        if (q != 'topicsRanked') {
            questionNodeIDs[q] = uuidv4()
            nodes.push({
                id: questionNodeIDs[q],
                label: q,
                image: '',
                title: q,
                size: 100,
                color: (questions[q].correct) ? '#27ae60' : '#c0392b'
            })
            questionData[q] = {
                focaleTitle: q,
                ...questions[q]
            }
        }

        let maxRelevance = Number.MIN_SAFE_INTEGER
            //Create nodes for ideas and link them to questions
            //ideas is the topicsRanked array
            //i is a single subtopic ('economic system', 'political ideology')
        for (const i of ideas) {
            const ideaID = uuidv4()
            const ideaRelevancey = (Math.sign(i.score) === -1) ? -i.score : i.score
            const forceRelevant = i.belongsTo.length > 1
            if (!forceRelevant && ideaRelevancey <= 1) continue;
            nodes.push({
                id: ideaID,
                label: i.topic,
                title: i.topic,
                size: 60,
                relevancy: ideaRelevancey,
                forceRelevant
            })

            //Link idea to question
            i.belongsTo.forEach(q => {
                edges.push({
                    from: questionNodeIDs[q],
                    to: ideaID,
                    length: 100,
                    title: '',
                    arrows: 'to'
                })
            })

            maxRelevance = Math.max(ideaRelevancey, maxRelevance)
        }


        return {
            nodes: nodes,
            edges: edges,
            questionData,
            maxRelevance: maxRelevance
        }
    }

    const fs = require('fs')
    fs.writeFileSync('./graph.json', JSON.stringify(toGraph(dataParsed)))

    /*

        //Create child (Communism, Red Scare)
        for (const key in childQuestion){
            childToID[key] = uuidv4()
            nodes.push({id:childToID[key], label: key, image: '', title: key, size: '60'})
        }


        for (const parent of topics) {
            //// Broader idea, moustache
           const topicID = uuidv4()
            nodes.push({
                id: topicID,
                label: parent.topic,
                title: parent.topic,
                size: 100,
                relevancy: -parent.score,
                type: 'parent'
            })
            
            //Questions that were wrong (Red Scaore)
            //parent.belongsTo: string[], relation: string "Communism" or "Stalin"
            for (const relation of parent.belongsTo) {
                const parentID = childToID[parent.topic]
             
                edges.push({
                    id: uuidv4(),
                    from: parentID,
                    to: topicID,
                    length: 100,
                    arrows: 'to',
                })
                
            
            }
        }*/

}
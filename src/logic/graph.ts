import { v4 as uuidv4 } from "uuid"

export function toGraph(data:any) {
    const nodes = [] as any[]
    const edges = [] as any[]
    const ideas = data.topicsRanked
    let maxRelevance = Number.MIN_SAFE_INTEGER
        // Stalin, Communism = questions
        // Economics, moustache = ideas
    const questions: any = data.mainTopics
    const questionNodeIDs: any = {}
    const questionData: any = {}

    //Create nodes for questions
    for (const q in questions) {
        if (q != 'topicsRanked') {
            questionNodeIDs[q] = uuidv4()
            nodes.push({
                id: questionNodeIDs[q],
                label: q,
                image: '',
                title: q,
                size: 500,
                color: (questions[q].correct) ? '#059669' : '#ef4444',
                font: {
                    face: 'Quicksand'
                }
            })
            questionData[questionNodeIDs[q]] = {
                focaleTitle: q,
                ...questions[q]
            }
        }
        //Create nodes for ideas and link them to questions
        //ideas is the topicsRanked array
        //i is a single subtopic ('economic system', 'political ideology')
        for (const i of ideas) {
            const ideaRelevancey = (Math.sign(i.score) === -1) ? -i.score : i.score
            const forceRelevant = i.belongsTo.length > 1
            if (!forceRelevant && ideaRelevancey <= 1) continue;

            if (!nodes.find(e => e.title.toLowerCase() === i.topic.toLowerCase())) {
                nodes.push({
                    id: uuidv4(),
                    label: i.topic,
                    title: i.topic,
                    size: 500,
                    relevancy: ideaRelevancey,
                    forceRelevant,
                    font: {
                        face: 'Quicksand'
                    }
                })
                
            }
            const ideaNode = nodes.find(e => e.title.toLowerCase() === i.topic.toLowerCase())
            questionData[ideaNode.id] = {
                focaleTitle: ideaNode.title
            }

            //Link idea to question
            i.belongsTo.forEach((q:string) => {
                //Skip if question is already linked
                if (edges.find(e => e.from === questionNodeIDs[q] && e.to === ideaNode.id)) return
                    //Skip if it links to the same question
                if (questionNodeIDs[q] === ideaNode.id) return
                edges.push({
                    from: questionNodeIDs[q],
                    to: ideaNode.id,
                    length: 100,
                    title: '',
                    arrows: 'to'
                })
            })

            maxRelevance = Math.max(ideaRelevancey, maxRelevance)
        }



    }

    return {
        nodes: nodes,
        edges: edges,
        questionData,
        maxRelevance: maxRelevance
    }

}
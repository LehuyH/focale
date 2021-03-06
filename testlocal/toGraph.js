const { v4: uuidv4 } = require('uuid')

//Import concepts.json
const dataParsed = require('./concepts.json')

// {id:uniqueNumber, label: 'Name', image: 'If there is one', title: 'Name', size: '60 is max'}
// {'from':topic, 'to':instanceOfTopic, 'length':100, 'title':'whaterver','arrows':'to'}
function toGraph(data) {
    const nodes = []
    const edges = []
    const ideas = data.topicsRanked
    let maxRelevance = Number.MIN_SAFE_INTEGER
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
                    size: 60,
                    relevancy: ideaRelevancey,
                    forceRelevant
                })
            }
            const ideaNode = nodes.find(e => e.title.toLowerCase() === i.topic.toLowerCase())

            //Link idea to question
            i.belongsTo.forEach(q => {
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


const fs = require('fs')
fs.writeFileSync('./graph.json', JSON.stringify(toGraph(dataParsed)))
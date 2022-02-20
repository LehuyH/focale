// let doc = nlp(buddyHolly)
// doc.people().if('mary').json()
//     // [{text:'Mary Tyler Moore'}]

import nlp from 'compromise'

// let doc = nlp(freshPrince)
// doc.places().first().text()
//     // 'West Phillidelphia'

// let doc = nlp('The Republic of China and the Empire of Japan are involved in the Second Sino-Japanese War.')

// console.log(doc.topics().json())

console.log(extractKeywords("World War II was one of the great watersheds of 20th-century geopolitical history. It resulted in the extension of the Soviet Union’s power to nations of eastern Europe, enabled a communist movement to eventually achieve power in China, and marked the decisive shift of power in the world away from the states of western Europe and toward the United States and the Soviet Union."))

// [
//   { text: 'richard nixon' },
//   { text: 'china' }
// ]

function extractKeywords(inputtext) {
    let doc = nlp(inputtext)
    return doc.topics().json()
}
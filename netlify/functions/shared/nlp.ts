import nlp from 'compromise'

export function extractKeywords(inputtext) {
    const doc = nlp(inputtext)
    return doc.topics().json()
}
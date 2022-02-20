import { fetch } from 'undici'
import fs from 'fs/promises';
//Search wikipedia api and return the first result's image and description
async function getWikipediaImage(search) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=50&pilimit=20&wbptterms=description&gpssearch=${search}&gpslimit=20`
    const response = await fetch(url)
    const json = await response.json()
    const pages = json.query.pages
    const pageId = Object.keys(pages)[0]
    const page = pages[pageId]
    const description = page.terms.description[0]
    const image = page.thumbnail.source
    fs.writeFile("wiki.json", description + image)
}

getWikipediaImage("joseph stalin")
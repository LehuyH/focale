import { Handler } from '@netlify/functions'
import { fetch } from 'undici'
export const handler: Handler = async (event, context) => {
  try{
    const { search } = JSON.parse(event.body) as { search: string }
    const data = await getWikipediaImage(search)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data
      })
    }
  }catch(e){
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: e.message
      })
    }
  }
}

async function getWikipediaImage(search: string) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=50&pilimit=20&wbptterms=description&gpssearch=${search}&gpslimit=20`
    const response = await fetch(url)
    const json = await response.json() as any
    const pages = json.query.pages
    const pageId = Object.keys(pages)[0]
    const page = pages[pageId]
    const description = page.terms.description[0]
    const image = page.thumbnail.source
    return { description, image };
}


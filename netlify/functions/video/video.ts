import { Handler } from '@netlify/functions'
import youtube from 'scrape-youtube'
const youtubers = ['Khan Academy', 'Bozeman Science', 'Heimler\'s History', 'OverSimplified']

export const handler: Handler = async (event, context) => {
  try{
    const { search } = JSON.parse(event.body) as { search: string }
    // POTNETIALLY CHANGE SEARCH TO INCLUDE 'overview' IMPORITANRTOAITHNDEFO:UHSE
    const embed: any = await youtube.search(`what is ${search} explained`).then((res: any) => {
        const sortedVideos = res.videos.sort((f: any, s: any) => {
            if (!f.channel.name.includes('news') && s.channel.name.includes('news'))
                return 1
            if (f.channel.name.includes('news') && !s.channel.name.includes('news'))
                return -1
            if (youtubers.includes(f.channel.name) && !youtubers.includes(s.channel.name))
                return 1
            if (!youtubers.includes(f.channel.name) && youtubers.includes(s.channel.name))
                return -1
            if (f.channel.verified && !s.channel.verified)
                return 1
            if (!f.channel.verified && s.channel.verified)  
                return -1
            if (f.views > s.views)
                return 1
            if (s.views > f.views)
                return -1
        })
        const vid = sortedVideos[sortedVideos.length-1]
        return `https://www.youtube.com/embed/${vid.id}?autoplay=1&modestbranding=1`
    })
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: embed
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

/*
// Khan Academy, Bozeman Science, Heimler's History, Oversimplified, Ted-Ed, Crash Course
const youtube = require('scrape-youtube');

const youtubers = ['Khan Academy', 'Bozeman Science', 'Heimler\'s History', 'OverSimplified']
video
async function doit(question) {
    const vid: any = youtube.search(`what is ${question} explained overview`).then((res: any) => {
            const sortedVideos = res.videos.sort((f: any, s: any) => {
                // 1 ==> f before s
                //-1 ==> f after s
                if (!f.channel.name.includes('news') && s.channel.name.includes('news')) {
                    // console.log(`${f.channel.name} before ${s.channel.name}`)
                    return 1
                }
                if (f.channel.name.includes('news') && !s.channel.name.includes('news')) {
                    // console.log(`${s.channel.name} before ${f.channel.name}`)
                    return -1
                }
                if (youtubers.includes(f.channel.name) && !youtubers.includes(s.channel.name)) {
                    // console.log(`${f.channel.name} before ${s.channel.name}`)
                    return 1
                }
                if (!youtubers.includes(f.channel.name) && youtubers.includes(s.channel.name)) {
                    // console.log(`${s.channel.name} before ${f.channel.name}`)
                    return -1
                }
                if (f.channel.verified && !s.channel.verified) {
                    // console.log(`${f.channel.name} before ${s.channel.name}`)
                    return 1
                }
                if (!f.channel.verified && s.channel.verified)   {
                    // console.log(`${s.channel.name} before ${f.channel.name}`)
                    return -1
                }
                if (f.views > s.views) {
                    // console.log(`${f.channel.name} before ${s.channel.name}`)
                    return 1
                }
                if (s.views > f.views) {
                    // console.log(`${s.channel.name} before ${f.channel.name}`)
                    return -1
                }
            }
        ).videos
        return sortedVideos[sortedVideos.length-1]
    })
    console.log(vid.id)
}
doit()
*/
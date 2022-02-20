// Khan Academy, Bozeman Science, Heimler's History, Oversimplified, Ted-Ed, Crash Course
const youtube = require('scrape-youtube');
const fs = require('fs');

const question = 'Joseph Stalin'

const youtubers = ['Khan Academy', 'Bozeman Science', 'Heimler\'s History', 'OverSimplified']
// Pick something from belongs too and choose a video
async function f() {
    const embed: any = await youtube.search(`what is ${question} explained overview`).then((res: any) => {
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
    console.log(embed)
}

f()
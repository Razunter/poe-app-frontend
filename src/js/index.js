import '../css/index.scss'
import LazyLoad from 'vanilla-lazyload'
import scrollSpy from 'simple-scrollspy'
import YTPlayer from 'yt-player'

const domain = 'raz-poebuilds.netlify.app'
const YTvids = []

const pauseVideos = () => {
    for (let video of YTvids) {
        video.pause()
    }
}

function process() {
    let YTcounter = 0

    new LazyLoad({})

    // NAV
    scrollSpy('.mainnav ul', {
        offset: 100,
        sectionClass: '.section'
    })

    // THUMBS
    const thumbs = document.getElementsByClassName('thumb')
    let i = thumbs.length
    while (i--) {
        thumbs[i].addEventListener('click', (event) => {
            pauseVideos()
            const url = event.target.getAttribute('data-video')
            if (event.target.classList.contains('YouTubeThumb')) {
                event.target.outerHTML = `<div id="ytvid-${YTcounter}"></div>`
                const player = new YTPlayer('#ytvid-' + YTcounter, {
                    width: '640',
                    height: '360',
                    autoplay: true
                })
                player.load(url, true)
                YTvids.push(player)
                YTcounter++
            } else if (event.target.classList.contains('twitchclipThumb') || event.target.classList.contains('twitchThumb')) {
                event.target.setAttribute('hidden', true)
                event.target.outerHTML = `<iframe src="https://player.twitch.tv/?video=v${url}&parent=${domain}" allowfullscreen="true" width="640" height="360" class="videoframe videoframe--twitch" frameborder="0"></iframe>`
            }
            // else if (event.target.classList.contains('streamableThumb')) {
            //     event.target.outerHTML = '<iframe src="' + url + '" frameborder="0" width="480" height="360" allowfullscreen frameborder="0"></iframe>';
            // }
        })
    }
}

// in case the document is already rendered
if (document.readyState !== 'loading') {
    process()
}// modern browsers
else {
    document.addEventListener('DOMContentLoaded', process)
}

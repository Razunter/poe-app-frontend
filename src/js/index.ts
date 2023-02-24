// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import scrollSpy from 'simple-scrollspy'
import YTPlayer from 'yt-player'

const domain = 'raz-poebuilds.netlify.app'
const YTvids: YTPlayer[] = []

const pauseVideos = () => {
  for (const video of YTvids) {
    video.pause()
  }
}

const process = () => {
  // NAV
  scrollSpy('.mainnav ul', {
    offset: 100,
    sectionClass: '.section',
  })

  // THUMBS
  const buttons = document.querySelectorAll('.video-button')
  for (const button of buttons) {
    let YTcounter = 0

    button.addEventListener('click', (event) => {
      const target = event.currentTarget as HTMLElement
      pauseVideos()
      const url = target.getAttribute('data-video')
      if (url && target.classList.contains('video-button--YouTube')) {
        target.outerHTML = `<div id="ytvid-${YTcounter}" class="videoWrap"></div>`
        const player = new YTPlayer('#ytvid-' + YTcounter, {
          width: 640,
          height: 360,
          autoplay: true,
        })
        player.load(url, true)
        YTvids.push(player)
        YTcounter++
      } else if (target.classList.contains('video-button--TwitchClip') || target.classList.contains('video-button--Twitch')) {
        target.setAttribute('hidden', '')
        target.outerHTML = `<iframe src="https://player.twitch.tv/?video=v${url}&parent=${domain}" allowfullscreen="true" width="640" height="360" class="videoframe videoframe--twitch" frameborder="0"></iframe>`
      }
      // else if (event.target.classList.contains('video-button--Streamable')) {
      //     event.target.outerHTML = '<iframe src="' + url + '" frameborder="0" width="480" height="360" allowfullscreen frameborder="0"></iframe>';
      // }
    })
  }
}

document.addEventListener('DOMContentLoaded', process)

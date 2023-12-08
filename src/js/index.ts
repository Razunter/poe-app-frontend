// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import scrollSpy from 'simple-scrollspy'

const domain = 'raz-poebuilds.netlify.app'

const pauseVideos = (clickedVideo) => {
  const videos = document.querySelectorAll<HTMLIFrameElement>('lite-youtube iframe')
  for (const video of videos) {
    if (video !== clickedVideo) {
      video.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
    }
  }
}

const process = () => {
  // NAV
  scrollSpy('.mainnav ul', {
    offset: 100,
    sectionClass: '.section',
  })

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement
      if (target.nodeName === 'LITE-YOUTUBE') {
        const iframe = target.querySelector('iframe')
        pauseVideos(iframe)
      }
    },
    { passive: true },
  )

  // THUMBS
  const buttons = document.querySelectorAll('.video-button')
  for (const button of buttons) {
    button.addEventListener(
      'click',
      (event) => {
        const target = event.currentTarget as HTMLElement
        const url = target.getAttribute('data-video')
        if (
          target.classList.contains('video-button--TwitchClip') ||
          target.classList.contains('video-button--Twitch')
        ) {
          target.setAttribute('hidden', '')
          target.outerHTML = `<iframe src="https://player.twitch.tv/?video=v${url}&parent=${domain}" allowfullscreen="true" width="640" height="360" class="videoframe videoframe--twitch" frameborder="0"></iframe>`
        }
        // else if (event.target.classList.contains('video-button--Streamable')) {
        //     event.target.outerHTML = '<iframe src="' + url + '" frameborder="0" width="480" height="360" allowfullscreen frameborder="0"></iframe>';
        // }
      },
      { passive: true },
    )
  }
}

document.addEventListener('DOMContentLoaded', process)

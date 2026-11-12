// The package's CommonJS entrypoint exposes a non-callable default in the browser bundle.
import scrollSpy from 'simple-scrollspy/src/index'

const domain = 'raz-poebuilds.netlify.app'
const process = () => {
  type YouTubePreview = HTMLElement & {
    getYTPlayer: () => Promise<{ pauseVideo: () => void } | undefined>
  }

  let selectedVideo: HTMLElement | null = null

  const pauseVideos = async (target: YouTubePreview) => {
    selectedVideo = target

    const clickedVideo = target.querySelector('iframe')
    const videos = document.querySelectorAll<HTMLIFrameElement>('lite-youtube iframe')

    for (const video of videos) {
      if (video !== clickedVideo) {
        video.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
      }
    }

    const player = await target.getYTPlayer()
    if (target !== selectedVideo) {
      player?.pauseVideo()
    }
  }

  // NAV
  scrollSpy('.mainnav ul', {
    offset: 100,
    sectionClass: '.section',
  })

  document.addEventListener(
    'click',
    (event) => {
      const target = (event.target as HTMLElement).closest<YouTubePreview>('lite-youtube')
      if (!target) {
        return
      }

      void pauseVideos(target)
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
        if (
          !target.classList.contains('video-button--TwitchClip') &&
          !target.classList.contains('video-button--Twitch')
        ) {
          return
        }

        const url = target.dataset.video
        target.setAttribute('hidden', '')
        target.outerHTML = `<iframe src="https://player.twitch.tv/?video=v${url}&parent=${domain}" allowfullscreen="true" width="640" height="360" class="videoframe videoframe--twitch" frameborder="0"></iframe>`
      },
      { passive: true },
    )
  }
}

document.addEventListener('DOMContentLoaded', process)

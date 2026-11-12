import versionsData from '../src/data/versions.json'
import { filterVersionData } from '../src/filterVersionData.ts'
import { type VersionDataType } from '../src/types.ts'
import { deepStrictEqual, equal, ok } from 'node:assert'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createContext, runInContext } from 'node:vm'

type Element = {
  tagName: string
  attributes: Map<string, string>
}

const whitespacePattern = /\s+/u
const backgroundImagePattern = /(?:^|;)\s*background-image\s*:\s*([^;]+)/iu
const attribute = (element: Element, name: string) => element.attributes.get(name)
const parsePosters = (html: string) => {
  type Section = {
    id: string | undefined
    cards: Element[][]
  }
  const sections: Section[] = []
  let highPriorityImages = 0
  new HTMLRewriter()
    .on('section.section', {
      element(element) {
        sections.push({ id: element.getAttribute('id') ?? undefined, cards: [] })
      },
    })
    .on('section.section figure.build', {
      element() {
        sections.at(-1)!.cards.push([])
      },
    })
    .on('section.section figure.build *', {
      element(element) {
        const card = sections.at(-1)!.cards.at(-1)!
        card.push({ tagName: element.tagName, attributes: new Map(element.attributes) })
      },
    })
    .on('img[fetchpriority="high"]', {
      element() {
        highPriorityImages++
      },
    })
    .transform(html)
  return { sections, highPriorityImages }
}
const embedSource = readFileSync(new URL('../node_modules/lite-youtube-embed/src/lite-yt-embed.js', import.meta.url), 'utf8')

const connectPreview = (host: Element, suppressBackground = true) => {
  const backgroundImages: string[] = []
  const imageRequests: string[] = []
  const backgroundImage = suppressBackground
    ? attribute(host, 'style')?.match(backgroundImagePattern)?.[1].trim() ?? ''
    : ''
  const style = {
    get backgroundImage() {
      return backgroundImages.at(-1) ?? backgroundImage
    },
    set backgroundImage(value: string) {
      backgroundImages.push(value)
    },
  }
  const playButton = { nodeName: 'BUTTON', textContent: 'Play' }

  class HostBoundary {
    dataset = {}
    style = style
    addEventListener() {}
    append() {}
    getAttribute(name: string) {
      return attribute(host, name) ?? null
    }

    hasAttribute(name: string) {
      return attribute(host, name) !== undefined
    }

    querySelector() {
      return playButton
    }
  }
  let Preview!: new () => HostBoundary & { connectedCallback: () => void }
  const context = createContext({
    HTMLElement: HostBoundary,
    URLSearchParams,
    navigator: { vendor: '', userAgent: 'Desktop' },
    document: { createElement: () => ({ outerHTML: '<iframe></iframe>' }) },
    customElements: { define: (_name: string, constructor: typeof Preview) => {
      Preview = constructor
    } },
    setTimeout: (callback: () => void) => {
      callback()
    },
    Image: class {
      set src(value: string) {
        imageRequests.push(value)
      }
    },
  })
  runInContext(embedSource, context, { filename: 'lite-yt-embed.js' })
  new Preview().connectedCallback()
  return { backgroundImages, imageRequests }
}

for (const version of versionsData.versions) {
  void test(`${version.version} production HTML schedules only the first rendered poster eagerly`, () => {
    const filename = version.version === versionsData.currentVersion ? 'index.html' : `old-${version.version}.html/index.html`
    const html = readFileSync(new URL(`../dist/${filename}`, import.meta.url), 'utf8')
    const document = parsePosters(html)
    const dataUrl = new URL(`../src/data/data-${version.version.replaceAll('.', '-')}.json`, import.meta.url)
    const dataSource = readFileSync(dataUrl, 'utf8')
    const data = filterVersionData(JSON.parse(dataSource) as VersionDataType, version)
    const { sections } = document
    deepStrictEqual(sections.map((section) => section.id), Object.keys(data.types))
    const posters: Element[] = []

    for (const section of sections) {
      const builds = data.buildList.find((collection) => collection.type === section.id)?.builds ?? []
      const expectedBuilds = builds.filter((build) => build.videothumb?.['480w'])
      const { cards } = section
      equal(cards.length, expectedBuilds.length, `${filename} ${section.id} poster count`)
      for (const [index, card] of cards.entries()) {
        const build = expectedBuilds[index]
        const descendants = card
        equal(attribute(descendants.find((element) => element.tagName === 'a')!, 'href'), build.url)
        const images = descendants.filter((element) => element.tagName === 'img')
        equal(images.length, 1, `${build.title} has one native poster`)
        const image = images[0]
        posters.push(image)
        const source = attribute(image, 'src')
        ok(source, `${build.title} has a poster source`)
        const candidates = (attribute(image, 'srcset') ?? '').split(',').map((candidate) => candidate.trim().split(whitespacePattern))
        const widths = candidates.map((candidate) => candidate[1]).toSorted((left, right) => left.localeCompare(right))
        const expectedWidths = Object.keys(build.videothumb!)
          .filter((size) => !build.video?.includes('youtube.com') || size === '480w' || size === '640w')
          .toSorted((left, right) => left.localeCompare(right))
        deepStrictEqual(widths, expectedWidths)
        ok(candidates.every(([url]) => url.length > 0), `${build.title} has responsive sources`)
        ok(attribute(image, 'sizes'), `${build.title} has responsive sizing`)
        const host = descendants.find((element) => element.tagName === 'lite-youtube')
        if (build.video?.includes('youtube.com')) {
          ok(host, `${build.title} retains its YouTube host`)
          ok(candidates.every(([, width]) => Number(width.slice(0, -1)) <= 640), `${build.title} avoids unnecessary YouTube downloads above 640px`)
          equal(attribute(image, 'alt'), '')
          for (const url of [source, ...candidates.map((candidate) => candidate[0])]) {
            ok(new URL(url).pathname.startsWith(`/vi_webp/${attribute(host, 'videoid')}/`))
            ok(new URL(url).pathname.endsWith('.webp'))
          }
          deepStrictEqual(connectPreview(host), { backgroundImages: [], imageRequests: [] })
          const unsuppressed = connectPreview(host, false)
          equal(unsuppressed.backgroundImages.length, 1, 'control observes the automatic JPEG background')
          equal(unsuppressed.imageRequests.length, 1, 'control observes the automatic WebP probe')
        } else {
          equal(source, build.videothumb?.['480w'])
          for (const [url, width] of candidates) equal(url, build.videothumb?.[width])
        }
      }
    }

    for (const [index, image] of posters.entries()) {
      equal(attribute(image, 'loading'), index === 0 ? 'eager' : 'lazy')
      equal(attribute(image, 'fetchpriority'), index === 0 ? 'high' : undefined)
    }
    equal(document.highPriorityImages, posters.length > 0 ? 1 : 0)
  })
}

import { deepStrictEqual, equal, rejects, strictEqual } from 'node:assert'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { setImmediate as flush } from 'node:timers/promises'
import { createContext, runInContext } from 'node:vm'
import { ScriptTarget, transpileModule } from 'typescript'

const componentSource = readFileSync(new URL('../node_modules/lite-youtube-embed/src/lite-yt-embed.js', import.meta.url), 'utf8')
const entrypointSource = transpileModule(
  readFileSync(new URL('../src/js/index.ts', import.meta.url), 'utf8')
    .replace('import scrollSpy from \'simple-scrollspy/src/index\'', 'const scrollSpy = () => {}'),
  { compilerOptions: { target: ScriptTarget.ES2020 } },
).outputText

type Listener = (event: { target: ElementBoundary, currentTarget: ElementBoundary }) => unknown

type SDKPlayer = {
  state: 'unstarted' | 'playing' | 'paused'
  playVideo: () => void
  pauseVideo: () => void
  ready: () => void
}

class ElementBoundary {
  attributes = new Map<string, string>()
  children: ElementBoundary[] = []
  classes = new Set<string>()
  classList = {
    add: (...names: string[]) => {
      for (const name of names) this.classes.add(name)
    },
    contains: (name: string) => this.classes.has(name),
  }

  contentWindow?: { postMessage: (message: string, origin: string) => void }
  dataset: Record<string, string> = {}
  innerHTML = ''
  listeners = new Map<string, Listener[]>()
  onerror?: (error: Error) => void
  onload?: () => void
  outerHTML = '<iframe></iframe>'
  parent: ElementBoundary | undefined
  src = ''
  style = { backgroundImage: 'url(test-poster)' }
  textContent = ''

  constructor(public nodeName = 'LITE-YOUTUBE') {}

  addEventListener(name: string, listener: Listener) {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), listener])
  }

  append(child: ElementBoundary) {
    child.parent = this
    this.children.push(child)
  }

  closest(selector: string): ElementBoundary | null {
    return this.matches(selector) ? this : this.parent?.closest(selector) ?? null
  }

  focus() {}
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null
  }

  hasAttribute(name: string) {
    return this.attributes.has(name)
  }

  matches(selector: string): boolean {
    return selector.split(',').some((part) => part.startsWith('.')
      ? this.classes.has(part.slice(1))
      : this.nodeName.toLowerCase() === part)
  }

  querySelector(selector: string): ElementBoundary | null {
    for (const child of this.children) {
      if (child.matches(selector)) return child
      const match = child.querySelector(selector)
      if (match) return match
    }
    return null
  }

  querySelectorAll(selector: string): ElementBoundary[] {
    return this.children.flatMap((child) => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)])
  }

  removeAttribute(name: string) {
    this.attributes.delete(name)
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value)
  }
}

const playback = ({ mobile = true, bootstrap = false } = {}) => {
  type Preview = ElementBoundary & {
    connectedCallback: () => void
    getYTPlayer: () => Promise<SDKPlayer | undefined>
  }
  const document = new ElementBoundary('#DOCUMENT')
  const head = new ElementBoundary('HEAD')
  document.append(head)
  const errors: unknown[] = []
  const players = new Map<string, SDKPlayer>()
  const readyCallbacks: (() => void)[] = []
  let apiAvailable = false
  let PreviewElement!: new () => Preview
  const sdk: { ready: (callback: () => void) => void, Player?: unknown } = {
    ready: (callback) => {
      if (apiAvailable) {
        callback()
      } else {
        readyCallbacks.push(callback)
      }
    },
  }
  const context = createContext({
    HTMLElement: ElementBoundary,
    URLSearchParams,
    navigator: { vendor: '', userAgent: mobile ? 'Mobi' : 'Desktop' },
    customElements: { define: (_name: string, element: new () => Preview) => {
      PreviewElement = element
    } },
    document: Object.assign(document, {
      head,
      createElement: (name: string) => new ElementBoundary(name.toUpperCase()),
      querySelectorAll: (selector: string) => selector === 'lite-youtube iframe'
        ? ElementBoundary.prototype.querySelectorAll.call(document, 'lite-youtube')
          .flatMap((preview: ElementBoundary) => preview.querySelectorAll('iframe'))
        : ElementBoundary.prototype.querySelectorAll.call(document, selector),
    }),
  })
  context.window = context
  if (bootstrap) context.YT = sdk
  runInContext(componentSource, context, { filename: 'lite-yt-embed.js' })
  runInContext(entrypointSource, context, { filename: 'src/js/index.ts' })

  const dispatch = (target: ElementBoundary, name: string) => {
    for (let current: ElementBoundary | undefined = target; current; current = current.parent) {
      const listeners = current.listeners.get(name) ?? []

      for (const listener of listeners) {
        const result = listener.call(current, { target, currentTarget: current })
        void (async () => {
          try {
            await result
          } catch (error) {
            errors.push(error)
          }
        })()
      }
    }
  }
  dispatch(document, 'DOMContentLoaded')
  const previews = ['first', 'second', 'untouched'].map((id) => {
    const preview = new PreviewElement()
    preview.setAttribute('videoid', id)
    const button = new ElementBoundary('BUTTON')
    button.classList.add('lyt-playbtn')
    button.textContent = 'Play'
    preview.append(button)
    document.append(preview)
    preview.connectedCallback()
    return preview
  })
  const scripts = () => document.querySelectorAll('script')
  const publishApi = () => {
    sdk.Player = class implements SDKPlayer {
      ready: () => void
      state: SDKPlayer['state'] = 'unstarted'
      constructor(placeholder: ElementBoundary, options: {
        videoId: string
        events: { onReady: (event: { target: SDKPlayer }) => void }
      }) {
        const iframe = new ElementBoundary('IFRAME')
        iframe.contentWindow = {
          postMessage: (message) => {
            if (JSON.parse(message).func === 'pauseVideo') this.pauseVideo()
          },
        }
        const parent = placeholder.parent!
        parent.children[parent.children.indexOf(placeholder)] = iframe
        iframe.parent = parent
        this.ready = () => {
          options.events.onReady({ target: this })
        }
        players.set(options.videoId, this)
      }

      pauseVideo() {
        this.state = 'paused'
      }

      playVideo() {
        this.state = 'playing'
      }
    }
    apiAvailable = true
    context.YT = sdk
    for (const script of scripts()) script.onload?.()
    const callbacks = readyCallbacks.splice(0)

    for (const callback of callbacks) callback()
  }

  return {
    previews, players, scripts, publishApi, errors,
    click: (index: number) => {
      dispatch(previews[index].querySelector('button')!, 'click')
    },
  }
}

void test('mobile activation waits through the YT bootstrap gap and exposes the ready player', async () => {
  const fixture = playback({ bootstrap: true })
  let settlement: { player: SDKPlayer | undefined } | { error: unknown } | undefined
  const result = fixture.previews[0].getYTPlayer()
  const observation = (async () => {
    try {
      settlement = { player: await result }
    } catch (error) {
      settlement = { error }
    }
  })()
  await flush()
  equal(settlement, undefined, 'getYTPlayer must stay pending while YT.Player is unavailable')
  equal(fixture.players.size, 0, 'bootstrap alone must not construct a player')
  equal(fixture.scripts().length, 0, 'an existing bootstrap must not load another SDK script')
  fixture.publishApi()
  await flush()
  const player = fixture.players.get('first')!
  equal(player.state, 'unstarted')
  equal(settlement, undefined, 'the public promise must wait for player readiness')
  player.ready()
  strictEqual(await result, player)
  await observation
  deepStrictEqual(settlement, { player })
  equal(player.state, 'playing')
})

for (const order of [[0, 1], [1, 0]]) {
  void test(`two pending mobile previews keep only the newest playing with readiness order ${order.join(',')}`, async () => {
    const fixture = playback()
    fixture.click(0)
    fixture.click(1)
    fixture.publishApi()
    await flush()
    const first = fixture.players.get('first')!
    const second = fixture.players.get('second')!

    for (const index of order) {
      ;[first, second][index].ready()
      await flush()
    }
    deepStrictEqual([first.state, second.state], ['paused', 'playing'])
    equal(fixture.scripts().length, 1, 'pending previews share one SDK load')
    strictEqual(await fixture.previews[0].getYTPlayer(), first)
    strictEqual(await fixture.previews[1].getYTPlayer(), second)
    equal(fixture.previews[2].querySelector('iframe'), null)
    equal(fixture.previews[2].classList.contains('lyt-activated'), false)
    equal(fixture.players.has('untouched'), false)
    deepStrictEqual(fixture.errors, [])
  })
}

void test('selecting a pending preview immediately pauses an already playing iframe', async () => {
  const fixture = playback()
  fixture.click(0)
  fixture.publishApi()
  await flush()
  const first = fixture.players.get('first')!
  first.ready()
  await flush()
  equal(first.state, 'playing')
  fixture.click(1)
  equal(first.state, 'paused', 'pause must happen during the click, before SDK readiness')
  await flush()
  const second = fixture.players.get('second')!
  second.ready()
  await flush()
  deepStrictEqual([first.state, second.state], ['paused', 'playing'])
  deepStrictEqual(fixture.errors, [])
})

void test('desktop activation exposes no API player and loads no SDK', async () => {
  const fixture = playback({ mobile: false })
  fixture.click(0)
  equal(await fixture.previews[0].getYTPlayer(), undefined)
  equal(fixture.previews[0].querySelectorAll('iframe').length, 1)
  equal(fixture.scripts().length, 0)
  equal(fixture.players.size, 0)
  deepStrictEqual(fixture.errors, [])
})

void test('SDK script failure rejects the public player promise with the original error', async () => {
  const fixture = playback()
  const failure = new Error('SDK script failed')
  const rejected = rejects(fixture.previews[0].getYTPlayer(), (error) => error === failure)
  fixture.scripts()[0].onerror!(failure)
  await rejected
})

import versionsData from '../src/data/versions.json'
import { filterVersionData } from '../src/filterVersionData.ts'
import { type VersionDataType } from '../src/types.ts'
import { deepStrictEqual, equal } from 'node:assert'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const decodeEscapedText = (text: string) => text
  .replaceAll('&nbsp;', '\u{A0}')
  .replaceAll('&#39;', '\'')
  .replaceAll('&quot;', '"')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&amp;', '&')

const parseSections = (html: string) => {
  type Section = {
    id: string | null
    heading: string
    icons: Array<string | null>
    builds: string[]
  }
  type NavigationLink = {
    href: string | null
    title: string
    icons: Array<string | null>
  }
  const sections: Section[] = []
  const navigation: NavigationLink[] = []
  new HTMLRewriter()
    .on('section.section', {
      element(element) {
        sections.push({ id: element.getAttribute('id'), heading: '', icons: [], builds: [] })
      },
    })
    .on('section.section h2', {
      text(chunk) {
        sections.at(-1)!.heading += chunk.text
      },
    })
    .on('section.section h2 use', {
      element(element) {
        sections.at(-1)!.icons.push(element.getAttribute('href') ?? element.getAttribute('xlink:href'))
      },
    })
    .on('section.section a.build-link', {
      element(element) {
        sections.at(-1)!.builds.push(decodeEscapedText(element.getAttribute('href') ?? ''))
      },
    })
    .on('nav.mainnav a', {
      element(element) {
        navigation.push({
          href: element.getAttribute('href'),
          title: decodeEscapedText(element.getAttribute('title') ?? ''),
          icons: [],
        })
      },
    })
    .on('nav.mainnav a use', {
      element(element) {
        navigation.at(-1)!.icons.push(element.getAttribute('href') ?? element.getAttribute('xlink:href'))
      },
    })
    .transform(html)
  for (const section of sections) {
    section.heading = decodeEscapedText(section.heading).trim()
  }
  return { sections, navigation }
}

for (const version of versionsData.versions) {
  void test(`${version.version} production HTML preserves collection titles and category identity`, () => {
    const filename = version.version === versionsData.currentVersion ? 'index.html' : `old-${version.version}.html/index.html`
    const html = readFileSync(new URL(`../dist/${filename}`, import.meta.url), 'utf8')
    const { sections, navigation } = parseSections(html)
    const dataUrl = new URL(`../src/data/data-${version.version.replaceAll('.', '-')}.json`, import.meta.url)
    const data = filterVersionData(JSON.parse(readFileSync(dataUrl, 'utf8')) as VersionDataType, version)
    const categoryKeys = Object.keys(data.types)
    deepStrictEqual(sections.map((section) => section.id), categoryKeys)
    deepStrictEqual(navigation.map((link) => link.href), categoryKeys.map((key) => `#${key}`))

    for (const [index, [key, title]] of Object.entries(data.types).entries()) {
      const section = sections[index]
      const link = navigation[index]
      equal(section.heading, title, `${filename} ${key} heading`)
      equal(link.title, title, `${filename} ${key} navigation tooltip`)
      deepStrictEqual(section.icons, [`#icon-${key}`])
      deepStrictEqual(link.icons, [`#icon-${key}`])
      const builds = data.buildList.find((category) => category.type === key)?.builds ?? []
      deepStrictEqual(
        section.builds.toSorted((left, right) => left.localeCompare(right)),
        builds.map((build) => build.url).toSorted((left, right) => left.localeCompare(right)),
        `${filename} ${key} filtered membership`,
      )
    }

    if (version.version === versionsData.currentVersion) {
      equal(sections.find((section) => section.id === 'rf')?.heading, 'Righteous Fire & Autobombers')
      equal(navigation.find((link) => link.href === '#rf')?.title, 'Righteous Fire & Autobombers')
    }
    if (version.version !== '3.14') {
      return
    }

    equal(sections.find((section) => section.id === 'ranged')?.heading, 'Archer')
    equal(navigation.find((link) => link.href === '#ranged')?.title, 'Archer')
    equal(sections.find((section) => section.id === 'rf')?.heading, 'Righteous Fire & Death\'s Oath')
    equal(navigation.find((link) => link.href === '#rf')?.title, 'Righteous Fire & Death\'s Oath')
  })
}

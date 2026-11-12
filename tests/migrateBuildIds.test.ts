import { migrateBuildIds } from '../scripts/migrateBuildIds.ts'
import { isUuidV4 } from '../src/collectionIdentity.ts'
import { deepStrictEqual, equal, notEqual, ok, throws } from 'node:assert'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const firstId = 'abcdef00-0000-4000-8000-000000000001'
const uppercaseId = firstId.toUpperCase()
const secondId = '00000000-0000-4000-8000-000000000002'
const conflicting = /Conflicting/u

type MigratedCollection = {
  unknown: { retained: boolean }
  types: Record<string, string>
  buildList: { type: string, builds: { id: string, title: string, url: string, versions: string[], extra: unknown[] }[] }[]
}
const fixture = (builds: object[]) => ({ unknown: { retained: true }, types: { a: 'A' }, buildList: [{ type: 'a', builds }] })
const entry = (url: string, id?: string) => ({ title: 'Original', url, versions: ['3.30'], extra: [1, { keep: true }], ...(id && { id }) })
const withDirectory = (run: (directory: string) => void) => {
  const directory = mkdtempSync(join(tmpdir(), 'collection-ids-'))

  try {
    run(directory)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}
const put = (directory: string, file: string, data: object) => writeFileSync(join(directory, file), JSON.stringify(data))
const get = (directory: string, file: string) => JSON.parse(readFileSync(join(directory, file), 'utf8')) as MigratedCollection

void test('migration dry-run writes nothing; write preserves all fields, shares exact URLs, and reruns unchanged', () => withDirectory((directory) => {
  const original = fixture([entry('/same'), entry('/different')])
  put(directory, 'data-a.json', original)
  put(directory, 'data-b.json', fixture([entry('/same')]))
  const before = readFileSync(join(directory, 'data-a.json'), 'utf8')
  migrateBuildIds(directory)
  equal(readFileSync(join(directory, 'data-a.json'), 'utf8'), before)
  deepStrictEqual(readdirSync(directory).toSorted((left, right) => left.localeCompare(right)), ['data-a.json', 'data-b.json'])
  migrateBuildIds(directory, { write: true })
  const migrated = get(directory, 'data-a.json')
  const [first, second] = migrated.buildList[0].builds
  ok(isUuidV4(first.id))
  notEqual(first.id, second.id)
  equal(first.id, get(directory, 'data-b.json').buildList[0].builds[0].id)
  const withoutIds = structuredClone(migrated)

  const buildsWithoutIds = withoutIds.buildList[0].builds

  for (const build of buildsWithoutIds) {
    Reflect.deleteProperty(build, 'id')
  }
  deepStrictEqual(withoutIds, original)
  const published = readFileSync(join(directory, 'data-a.json'), 'utf8')
  migrateBuildIds(directory, { write: true })
  equal(readFileSync(join(directory, 'data-a.json'), 'utf8'), published)
  equal(readFileSync(join(directory, '.identity-migration/originals/data-a.json'), 'utf8'), before)
}))

void test('existing IDs seed missing assignments and reviewed mappings describe URL continuity and reuse', () => withDirectory((directory) => {
  put(directory, 'data-a.json', fixture([entry('/old', firstId), entry('/reused')]))
  put(directory, 'data-b.json', fixture([entry('/new'), entry('/reused')]))
  const mapping = { 'data-a.json': { '/old': firstId.toUpperCase(), '/reused': secondId }, 'data-b.json': { '/new': firstId } }
  migrateBuildIds(directory, { write: true, mapping })
  equal(get(directory, 'data-b.json').buildList[0].builds[0].id, firstId)
  notEqual(get(directory, 'data-b.json').buildList[0].builds[1].id, secondId)
  migrateBuildIds(directory, { write: true, mapping })
}))

void test('migration rejects malformed input, ID collisions and contradictory assignments without publishing', () => {
  for (const builds of [[entry('/a', 'bad')], [entry('/a', firstId), entry('/b', firstId)], [entry('/a'), { title: 'No URL' }]]) {
    withDirectory((directory) => {
      put(directory, 'data-a.json', fixture(builds))
      throws(() => migrateBuildIds(directory, { write: true }))
      deepStrictEqual(readdirSync(directory), ['data-a.json'])
    })
  }
  withDirectory((directory) => {
    put(directory, 'data-a.json', fixture([entry('/same', firstId)]))
    put(directory, 'data-b.json', fixture([entry('/same', secondId)]))
    throws(() => migrateBuildIds(directory), conflicting)
  })
})

void test('interrupted publication resumes planned IDs instead of generating new assignments', () => withDirectory((directory) => {
  put(directory, 'data-a.json', fixture([entry('/a')]))
  put(directory, 'data-b.json', fixture([entry('/b')]))
  const originalB = readFileSync(join(directory, 'data-b.json'), 'utf8')
  migrateBuildIds(directory, { write: true })
  const assignedB = get(directory, 'data-b.json').buildList[0].builds[0].id
  writeFileSync(join(directory, 'data-b.json'), originalB)
  migrateBuildIds(directory, { write: true })
  equal(get(directory, 'data-b.json').buildList[0].builds[0].id, assignedB)
}))

void test('existing identities survive changed URLs and UUID casing', () => withDirectory((directory) => {
  put(directory, 'data-a.json', fixture([entry('/same', firstId)]))
  put(directory, 'data-b.json', fixture([entry('/renamed', firstId)]))
  put(directory, 'data-c.json', fixture([entry('/same')]))
  put(directory, 'data-d.json', fixture([entry('/same', uppercaseId)]))
  let failure: unknown

  try {
    migrateBuildIds(directory, { write: true })
  } catch (error) {
    failure = error
  }
  equal(failure, undefined)
  equal(get(directory, 'data-a.json').buildList[0].builds[0].id, firstId)
  equal(get(directory, 'data-b.json').buildList[0].builds[0].id, firstId)
  equal(get(directory, 'data-c.json').buildList[0].builds[0].id, firstId)
  equal(get(directory, 'data-d.json').buildList[0].builds[0].id, uppercaseId)
}))

void test('shared videos are reported across fields without blocking or merging historical entries', () => withDirectory((directory) => {
  put(directory, 'data-a.json', fixture([{ ...entry('/guide'), video: 'https://youtu.be/abcdefghijk?t=12' }, entry('https://www.youtube.com/watch?v=abcdefghijk&feature=share')]))
  const result = migrateBuildIds(directory, { write: true })
  deepStrictEqual(result.sharedVideos, [
    {
      file: 'data-a.json',
      video: 'abcdefghijk',
      urls: ['/guide', 'https://www.youtube.com/watch?v=abcdefghijk&feature=share'],
    },
  ])
  equal(get(directory, 'data-a.json').buildList[0].builds.length, 2)
}))

void test('malformed collection JSON fails before any collection is published', () => withDirectory((directory) => {
  put(directory, 'data-a.json', fixture([entry('/a')]))
  writeFileSync(join(directory, 'data-b.json'), '{broken')
  throws(() => migrateBuildIds(directory, { write: true }))
  deepStrictEqual(readdirSync(directory).toSorted((left, right) => left.localeCompare(right)), ['data-a.json', 'data-b.json'])
  deepStrictEqual(get(directory, 'data-a.json'), fixture([entry('/a')]))
}))

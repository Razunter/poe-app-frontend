import { parseCollection } from '../src/collectionIdentity.ts'
import { filterVersionData } from '../src/filterVersionData.ts'
import { deepStrictEqual, equal, throws } from 'node:assert'
import { test } from 'node:test'

const id = '00000000-0000-4000-8000-000000000001'
const otherId = '00000000-0000-4000-8000-000000000002'
const invalidId = /UUIDv4/u
const duplicateId = /Duplicate/u
const collection = () => ({
  types: { melee: 'Melee', ranged: 'Ranged' },
  buildList: [{ type: 'melee', builds: [{ id, title: 'First', url: '/shared', video: 'https://www.youtube.com/watch?v=abcdefghijk', versions: ['3.30'] }] }, { type: 'ranged', builds: [{ id: otherId, title: 'Second', url: '/shared', video: 'https://www.youtube.com/watch?v=abcdefghijk', versions: ['3.30'] }] }],
})

void test('strict ingestion preserves saved IDs and historical URL/video duplicates through filtering', () => {
  const saved = collection()
  equal(parseCollection(saved), saved)
  deepStrictEqual(filterVersionData(parseCollection(saved), { name: 'Test', version: '3.30' }), saved)
})

void test('strict ingestion rejects missing, malformed and cross-category colliding IDs before filtering', () => {
  for (const invalid of [
    undefined,
    '',
    '00000000-0000-1000-8000-000000000001',
    12,
  ]) {
    const data = collection()
    Object.assign(data.buildList[0].builds[0], { id: invalid, skip: true })
    throws(() => parseCollection(data), invalidId)
  }
  const data = collection()
  data.buildList[1].builds[0].id = id
  throws(() => parseCollection(data), duplicateId)
})

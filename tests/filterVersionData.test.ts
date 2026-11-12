import { filterVersionData } from '../src/filterVersionData.ts'
import { type VersionDataType, type VersionType } from '../src/types.ts'
import { deepStrictEqual } from 'node:assert'
import { test } from 'node:test'

void test('league filtering keeps current and compatible builds and removes skipped builds and empty categories', () => {
  const version: VersionType = { name: 'Test league', version: '3.26', compatible: ['3.25'] }
  const compatibleBuild = { id: '00000000-0000-4000-8000-000000000001', title: 'Compatible build', url: '/compatible', versions: ['3.25'] }
  const currentBuild = { id: '00000000-0000-4000-8000-000000000002', title: 'Current build', url: '/current', versions: ['3.26'] }
  const data = {
    types: { active: 'Active category', empty: 'Empty category' },
    buildList: [
      {
        type: 'empty',
        builds: [{ id: '00000000-0000-4000-8000-000000000003', title: 'Incompatible build', url: '/incompatible', versions: ['3.24'] }],
      },
      {
        type: 'active',
        builds: [
          compatibleBuild,
          { id: '00000000-0000-4000-8000-000000000004', title: 'Skipped current build', url: '/skip-current', versions: ['3.26'], skip: true },
          { id: '00000000-0000-4000-8000-000000000005', title: 'Missing versions', url: '/missing' },
          currentBuild,
          { id: '00000000-0000-4000-8000-000000000006', title: 'Skipped compatible build', url: '/skip-compatible', versions: ['3.25'], skip: true },
          { id: '00000000-0000-4000-8000-000000000007', title: 'Malformed versions', url: '/malformed', versions: '3.26' },
        ],
      },
    ],
  } as unknown as VersionDataType
  const original = structuredClone(data)

  deepStrictEqual(filterVersionData(data, version), {
    types: { active: 'Active category' },
    buildList: [
      {
        type: 'active',
        builds: [compatibleBuild, currentBuild],
      },
    ],
  })
  deepStrictEqual(data, original)
})

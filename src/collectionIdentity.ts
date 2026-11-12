import { type VersionDataType } from './types.ts'

const uuidV4 = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu

export const isUuidV4 = (value: unknown): value is string => typeof value === 'string' && uuidV4.test(value)

export const parseCollection = (input: unknown, source = 'collection'): VersionDataType => {
  if (!input || typeof input !== 'object' || !('buildList' in input) || !Array.isArray(input.buildList)) {
    throw new Error(`${source}: expected a collection buildList`)
  }
  const ids = new Set<string>()

  for (const category of input.buildList) {
    if (!category || !Array.isArray(category.builds)) {
      throw new Error(`${source}: expected category builds`)
    }
    for (const build of category.builds) {
      if (!build || !isUuidV4(build.id)) {
        throw new Error(`${source}: entry ${build?.title ?? '(unknown)'} requires a UUIDv4 id`)
      }
      const normalized = build.id.toLowerCase()
      if (ids.has(normalized)) {
        throw new Error(`${source}: Duplicate entry id ${build.id}`)
      }
      ids.add(normalized)
    }
  }
  return input as VersionDataType
}

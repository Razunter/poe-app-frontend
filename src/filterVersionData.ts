import { type VersionDataType, type VersionType } from './types.ts'

export const filterVersionData = (data: VersionDataType, version: VersionType): VersionDataType => {
  const types = { ...data.types }
  const buildList = [...data.buildList]

  for (const type of Object.keys(types)) {
    const categoryIndex = buildList.findIndex((category) => {
      return category.type === type
    })

    if (categoryIndex === -1) {
      continue
    }

    const category = buildList[categoryIndex]
    const builds = category.builds.filter((build) => {
      return !build.skip && Array.isArray(build.versions) && (
        build.versions.includes(version.version) ||
        (Array.isArray(version.compatible) && version.compatible.some((compatible) => {
          return build.versions.includes(compatible)
        }))
      )
    })

    if (builds.length === 0) {
      delete types[type]
      buildList.splice(categoryIndex, 1)
    } else {
      buildList[categoryIndex] = { ...category, builds }
    }
  }

  return { ...data, types, buildList }
}

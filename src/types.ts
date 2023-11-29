export type VersionDataType = {
  types: Record<string, string>
  buildList: Array<{
    type: string
    builds: BuildDataType[]
  }>
}

export type BuildDataType = {
  title: string
  url: string
  video?: string
  videothumb?: {
    [key: string]: string | undefined
    '480w'?: string
    '640w'?: string
    '1280w'?: string
  }
  versions: string[]
  author?: string
  skip?: boolean
}

export type VersionType = {
  name: string
  version: string
  wip?: boolean
  url?: string
  note?: string
  skiprf?: boolean
  compatible?: string[]
}

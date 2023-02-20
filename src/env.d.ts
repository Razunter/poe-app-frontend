// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="astro/client" />

// eslint-disable-next-line unicorn/prevent-abbreviations
type VersionDataType = {
  types: Record<string, string>;
  buildList: Array<{
    type: string;
    builds: BuildDataType[];
  }>;
}

type BuildDataType = {
  title: string;
  url: string;
  video?: string;
  videothumb?: {
    '480w'?: string;
    '640w'?: string;
    '1280w'?: string;
  };
  versions: string[];
  author?: string;
}

// eslint-disable-next-line import/no-named-as-default
import glob from 'fast-glob'
import fs from 'node:fs'
import path from 'node:path'
import SVGSprite, { type Config } from 'svg-sprite'

const cwd = path.resolve('./src/components/sprite-icons')
const spriteConfig = {
  mode: {
    symbol: {
      inline: true,
      sprite: 'sprite.svg',
      example: false,
    },
  },
  shape: {
    transform: ['svgo'],
    id: {
      generator: 'icon-%s',
    },
  },
  svg: {
    xmlDeclaration: false,
    doctypeDeclaration: false,
  },
} as Config

export default async () => {
  // Make a new SVGSpriter instance w/ configuration
  const spriter = new SVGSprite(spriteConfig)

  // Get all SVG icon files in working directory
  const files = await glob('**/*.svg', { cwd })

  // Add them all to the spriter
  for (const file of files) {
    const filePath = path.join(cwd, file)
    spriter.add(filePath, null, fs.readFileSync(filePath, 'utf8'))
  }

  const compiledSprite: Map<string, Buffer> = new Map()

  spriter.compile((error, result: CompileResult) => {
    if (error) {
      throw error
    }

    for (const mode in result) {
      if (Object.hasOwn(result, mode)) {
        for (const resource in result[mode]) {
          if (Object.hasOwn(result[mode], resource)) {
            compiledSprite.set(mode, result[mode][resource].contents)
          }
        }
      }
    }
  })

  return compiledSprite?.get('symbol')?.toString()
}

type CompileResult = Record<
  string,
  Record<
    string,
    {
      contents: Buffer
    }
  >
>

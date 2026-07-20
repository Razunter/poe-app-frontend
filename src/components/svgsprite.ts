import fs from 'node:fs'
import path from 'node:path'
import SVGSprite, { type Config } from 'svg-sprite'
import { glob } from 'tinyglobby'

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

const svgsprite = async () => {
  // Make a new SVGSpriter instance w/ configuration
  const spriter = new SVGSprite(spriteConfig)

  // Get all SVG icon files in working directory
  const files = await glob('**/*.svg', { cwd })

  // Add them all to the spriter
  for (const file of files) {
    const filePath = path.join(cwd, file)
    const content = await fs.promises.readFile(filePath, 'utf8')
    spriter.add(filePath, null, content)
  }

  const result = await new Promise<CompileResult>((resolve, reject) => {
    spriter.compile((error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })

  const compiledSprite: Map<string, Buffer> = new Map()

  for (const mode in result) {
    if (Object.hasOwn(result, mode)) {
      for (const resource in result[mode]) {
        if (Object.hasOwn(result[mode], resource)) {
          compiledSprite.set(mode, result[mode][resource].contents)
        }
      }
    }
  }

  return compiledSprite?.get('symbol')?.toString()
}

export default svgsprite

type CompileResult = Record<string, Record<string, { contents: Buffer }>>

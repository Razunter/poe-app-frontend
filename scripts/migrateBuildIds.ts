import { isUuidV4, parseCollection } from '../src/collectionIdentity.ts'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

type ReviewedMapping = Record<string, Record<string, string>>
const collectionFilename = /^data-[\w-]+\.json$/u
const videoId = /^[\w-]{11}$/u
const youtubeHosts = new Set([
  'm.youtube.com',
  'music.youtube.com',
  'www.youtube-nocookie.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'youtube.com',
])

const youtubeId = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined
  }
  try {
    const url = new URL(value)
    const parts = url.pathname.split('/')
    let id: string | null | undefined
    if (url.hostname === 'youtu.be') {
      id = parts[1]
    } else if (youtubeHosts.has(url.hostname)) {
      if (url.pathname === '/watch') {
        id = url.searchParams.get('v')
      } else if (['embed', 'live', 'shorts'].includes(parts[1])) {
        id = parts[2]
      }
    }
    return id && videoId.test(id) ? id : undefined
  } catch {
    return undefined
  }
}

export const migrateBuildIds = (directory: string, options: { write?: boolean, mapping?: ReviewedMapping } = {}) => {
  type PlannedFile = { name: string, original: string, output: string }
  type Entry = Record<string, unknown> & { url: string, id?: string }
  type Plan = { files: PlannedFile[], sharedVideos: { file: string, video: string, urls: string[] }[] }
  type Collection = Record<string, unknown> & { buildList: { builds: Entry[] }[] }
  const filenames = readdirSync(directory).filter((name) => collectionFilename.test(name)).toSorted((left, right) => left.localeCompare(right))
  if (filenames.length === 0) {
    throw new Error('No data-*.json collections found')
  }
  const state = join(directory, '.identity-migration')
  const manifest = join(state, 'plan.json')
  let plan: Plan
  if (existsSync(manifest)) {
    plan = JSON.parse(readFileSync(manifest, 'utf8')) as Plan
    if (JSON.stringify(plan.files.map((file) => file.name)) !== JSON.stringify(filenames)) {
      throw new Error('Collection file set differs from saved migration plan')
    }
    for (const file of plan.files) {
      const current = readFileSync(join(directory, file.name), 'utf8')
      if (current !== file.original && current !== file.output) {
        throw new Error(`Collection changed since migration plan: ${file.name}. Keep .identity-migration intact and reconcile or restore the collection before continuing; see CONTRIBUTING.md.`)
      }
    }
    if (options.mapping) {
      for (const [name, assignments] of Object.entries(options.mapping)) {
        const file = plan.files.find((candidate) => candidate.name === name)
        if (!file || !assignments || typeof assignments !== 'object' || Array.isArray(assignments)) {
          throw new Error(`Invalid reviewed mapping file: ${name}`)
        }
        const data = JSON.parse(file.output) as Collection
        const entries = data.buildList.flatMap((category) => category.builds)

        for (const [url, id] of Object.entries(assignments)) {
          if (!isUuidV4(id) || entries.every((entry) => entry.url !== url || entry.id?.toLowerCase() !== id.toLowerCase())) {
            throw new Error(`Mapping conflicts with saved migration plan: ${name} ${url}`)
          }
        }
      }
    }
  } else {
    const files = filenames.map((name) => {
      const original = readFileSync(join(directory, name), 'utf8')
      const data = JSON.parse(original) as Collection
      if (!data || typeof data !== 'object' || !Array.isArray(data.buildList)) {
        throw new Error(`Malformed collection: ${name}`)
      }
      const seen = new Set<string>()

      for (const category of data.buildList) {
        if (!category || !Array.isArray(category.builds)) {
          throw new Error(`Malformed category: ${name}`)
        }
        for (const entry of category.builds) {
          if (!entry || typeof entry !== 'object' || typeof entry.url !== 'string' || !entry.url) {
            throw new Error(`Malformed entry URL: ${name}`)
          }
          if (!('id' in entry)) {
            continue
          }
          if (!isUuidV4(entry.id)) {
            throw new Error(`Malformed UUIDv4: ${name} ${entry.url}`)
          }
          const id = entry.id.toLowerCase()
          if (seen.has(id)) {
            throw new Error(`Duplicate ID: ${name} ${entry.id}`)
          }
          seen.add(id)
        }
      }
      return { name, original, data }
    })
    const mapping = options.mapping ?? {}

    for (const [name, assignments] of Object.entries(mapping)) {
      const file = files.find((candidate) => candidate.name === name)
      if (!file || !assignments || typeof assignments !== 'object' || Array.isArray(assignments)) {
        throw new Error(`Invalid reviewed mapping file: ${name}`)
      }
      for (const [url, id] of Object.entries(assignments)) {
        if (!isUuidV4(id) || file.data.buildList.every((category) => category.builds.every((entry) => entry.url !== url))) {
          throw new Error(`Invalid reviewed mapping: ${name} ${url}`)
        }
      }
    }
    const assignments = new Map<string, string>()

    for (const file of files) {
      const entries = file.data.buildList.flatMap((category) => category.builds)

      for (const entry of entries) {
        const reviewed = mapping[file.name]?.[entry.url]
        if (reviewed && entry.id && reviewed.toLowerCase() !== entry.id.toLowerCase()) {
          throw new Error(`Conflicting reviewed ID: ${file.name} ${entry.url}`)
        }
        const id = reviewed ?? entry.id
        if (!id) {
          continue
        }
        if (!reviewed) {
          const existing = assignments.get(entry.url)
          if (existing && existing.toLowerCase() !== id.toLowerCase()) {
            throw new Error(`Conflicting IDs for URL ${entry.url}`)
          }
          assignments.set(entry.url, existing ?? id)
        }
      }
    }
    const sharedVideos: Plan['sharedVideos'] = []
    const plannedFiles = files.map((file) => {
      const videos = new Map<string, Entry[]>()
      let changed = false

      const entries = file.data.buildList.flatMap((category) => category.builds)

      for (const entry of entries) {
        const reviewed = mapping[file.name]?.[entry.url]
        let id = reviewed ?? assignments.get(entry.url)
        if (!id) {
          id = randomUUID()
          assignments.set(entry.url, id)
        }
        if (!entry.id) {
          entry.id = id
          changed = true
        }
        const entryVideos = new Set([youtubeId(entry.url), youtubeId(entry.video)])

        for (const video of entryVideos) {
          if (!video) {
            continue
          }
          const group = videos.get(video) ?? []
          group.push(entry)
          videos.set(video, group)
        }
      }
      parseCollection(file.data, file.name)
      for (const [video, entries] of videos) {
        if (entries.length > 1) {
          sharedVideos.push({ file: file.name, video, urls: entries.map((entry) => entry.url) })
        }
      }
      return { name: file.name, original: file.original, output: changed ? JSON.stringify(file.data, null, 2) + '\n' : file.original }
    })
    plan = { files: plannedFiles, sharedVideos }
  }
  const changed = plan.files.filter((file) => readFileSync(join(directory, file.name), 'utf8') !== file.output)
  if (options.write && changed.length > 0) {
    mkdirSync(join(state, 'originals'), { recursive: true })
    mkdirSync(join(state, 'staged'), { recursive: true })
    if (!existsSync(manifest)) {
      for (const file of plan.files) {
        const backup = join(state, 'originals', file.name)
        if (existsSync(backup)) {
          if (readFileSync(backup, 'utf8') !== file.original) {
            throw new Error(`Original backup differs: ${file.name}`)
          }
        } else {
          writeFileSync(backup, file.original, { flag: 'wx' })
        }
      }
      writeFileSync(join(state, 'plan.json.tmp'), JSON.stringify(plan, null, 2) + '\n')
      renameSync(join(state, 'plan.json.tmp'), manifest)
    }
    for (const file of changed) {
      writeFileSync(join(state, 'staged', file.name), file.output)
    }
    for (const file of plan.files) {
      const current = readFileSync(join(directory, file.name), 'utf8')
      if (current !== file.original && current !== file.output) {
        throw new Error(`Collection changed before publication: ${file.name}`)
      }
    }
    for (const file of changed) {
      renameSync(join(state, 'staged', file.name), join(directory, file.name))
    }
  }
  return { files: plan.files.length, changed: changed.map((file) => file.name), sharedVideos: plan.sharedVideos, write: Boolean(options.write) }
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try {
    const args = process.argv.slice(2)
    let directory = 'src/data'
    let mapping: ReviewedMapping | undefined
    let write = false

    for (let index = 0; index < args.length; index++) {
      const argument = args[index]
      const value = args[index + 1]
      if (argument === '--write') {
        write = true
      } else if (argument === '--dir' && value !== undefined) {
        directory = args[++index]
      } else if (argument === '--mapping' && value !== undefined) {
        mapping = JSON.parse(readFileSync(args[++index], 'utf8')) as ReviewedMapping
      } else {
        throw new Error('Usage: bun scripts/migrateBuildIds.ts [--dir DIRECTORY] [--mapping FILE.json] [--write]')
      }
    }
    const result = migrateBuildIds(resolve(directory), { write, mapping })
    process.stdout.write(JSON.stringify(result, null, 2) + '\n')
  } catch (error) {
    process.stderr.write((error instanceof Error ? error.message : String(error)) + '\n')
    process.exitCode = 1
  }
}

import tsParser from '@typescript-eslint/parser'
import * as astroParser from 'astro-eslint-parser'
import type { Linter } from 'eslint'
import auto from 'eslint-config-canonical/auto'
import { recommended as canonical } from 'eslint-config-canonical/canonical'
import { recommended as canonicalJSDoc } from 'eslint-config-canonical/jsdoc'
import { recommended as canonicalPrettier } from 'eslint-config-canonical/prettier'
import { recommended as canonicalRegexp } from 'eslint-config-canonical/regexp'
import { recommended as canonicalTS } from 'eslint-config-canonical/typescript'
import { recommended as canonicalTSTC } from 'eslint-config-canonical/typescript-type-checking'
import { configs as eslintPluginAstro } from 'eslint-plugin-astro'
import * as depend from 'eslint-plugin-depend'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const newPrettierConfig = canonicalPrettier[0].rules['prettier/prettier'][1]
newPrettierConfig.semi = false
newPrettierConfig.printWidth = 120
newPrettierConfig.jsxSingleQuote = false
newPrettierConfig.singleAttributePerLine = false

const generalJS = {
  '@stylistic/semi': [2, 'never'],
  'canonical/destructuring-property-newline': ['off'],
  'canonical/id-match': ['off'],
  'canonical/sort-keys': ['off'],
  'comma-dangle': [
    'error',
    {
      arrays: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
      imports: 'always-multiline',
      objects: 'always-multiline',
    },
  ],
  'import/no-unassigned-import': [2, { allow: ['**/*.css', '**/*.scss', '**/*.postcss'] }],
  'linebreak-style': ['off'],
  'object-curly-newline': [
    'error',
    {
      consistent: true,
    },
  ],
  'prettier/prettier': [2, newPrettierConfig],
  'import/extensions': [
    2,
    'never',
    {
      ignorePackages: true,
      pattern: {
        astro: 'always',
        css: 'always',
        graphql: 'always',
        jpg: 'always',
        js: 'always',
        json: 'always',
        jsx: 'always',
        md: 'always',
        png: 'always',
        scss: 'always',
        svelte: 'always',
        svg: 'always',
        ts: 'always',
        tsx: 'always',
        webp: 'always',
      },
    },
  ],
  'perfectionist/sort-objects': 'off',
  'perfectionist/sort-object-types': 'off',
  'perfectionist/sort-intersection-types': 'off',
  'perfectionist/sort-jsx-props': 'off',
} satisfies Partial<Linter.RulesRecord>

const ts = {
  '@typescript-eslint/naming-convention': ['warn'],
  '@typescript-eslint/no-extra-parens': 'off',
  // '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  'canonical/import-specifier-newline': 'off',
  'canonical/prefer-inline-type-import': 'off',
  'typescript-sort-keys/interface': 'off',
  'import/consistent-type-specifier-style': 'off', // not granular enough
  'import/no-duplicates': 'warn',
  // Incompatible rules
  '@typescript-eslint/dot-notation': 'off',
} satisfies Partial<Linter.RulesRecord>

const canonicalStrictTSRules = canonicalTSTC[0].rules
delete canonicalStrictTSRules['@typescript-eslint/no-throw-literal']

const parserOptions = {
  ecmaVersion: 'latest',
  extraFileExtensions: ['.astro', '.svelte'],
  parser: tsParser,
  project: true,
  sourceType: 'module',
  tsconfigRootDir: __dirname,
} satisfies Linter.ParserOptions

export default defineConfig([
  globalIgnores(['.astro/**/*', '.idea/**/*', '.vscode/**/*', 'dist/**/*', 'node_modules/**/*']),
  ...auto,
  depend.configs['flat/recommended'],
  {
    files: ['*.astro', '**/*.astro'],
    languageOptions: {
      parser: astroParser,
      globals: {
        ...globals.browser,
      },
      parserOptions,
    },
    plugins: {
      ...canonical[0].plugins,
      ...canonicalTS[0].plugins,
      ...canonicalTSTC[0].plugins,
      ...canonicalRegexp[0].plugins,
      ...canonicalPrettier[0].plugins,
      ...canonicalJSDoc[0].plugins,
    },
    rules: {
      ...canonical[0].rules,
      ...canonicalTS[0].rules,
      ...canonicalStrictTSRules,
      ...canonicalRegexp[0].rules,
      ...canonicalPrettier[0].rules,
      ...canonicalJSDoc[0].rules,
      ...generalJS,
      ...ts,
      '@typescript-eslint/no-misused-promises': 'off', // broken
      'consistent-return': 'off', // broken
      'canonical/filename-match-regex': 'off',
      'prettier/prettier': [
        2,
        {
          ...newPrettierConfig,
          files: '*.astro',
          parser: 'astro',
          plugins: ['prettier-plugin-astro'],
        },
      ],
    },
    extends: [eslintPluginAstro['flat/recommended'], eslintPluginAstro['flat/jsx-a11y-recommended']],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions,
    },
    rules: {
      ...generalJS,
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions,
    },
    rules: {
      ...generalJS,
      ...ts,
    },
  },
])

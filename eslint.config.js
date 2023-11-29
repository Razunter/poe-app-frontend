import { FlatCompat } from '@eslint/eslintrc'
import prettierConfig from 'eslint-config-canonical/configurations/prettier.js'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const newPrettierConfig = prettierConfig.rules['prettier/prettier'][1]
newPrettierConfig.semi = false
newPrettierConfig.printWidth = 120

const generalJS = {
  '@babel/no-invalid-this': ['off'],
  '@babel/semi': ['error', 'never'],
  semi: ['error', 'never'],
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
  'import/no-unassigned-import': [
    2,
    { allow: ['**/*.css', '**/*.scss', '**/*.postcss'] },
  ],
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
        js: 'always',
        jsx: 'always',
        ts: 'always',
        tsx: 'always',
        svelte: 'always',
        svg: 'always',
        graphql: 'always',
        json: 'always',
      },
    },
  ],
}

const ts = {
  '@typescript-eslint/naming-convention': ['warn'],
  '@typescript-eslint/no-extra-parens': 'off',
  '@typescript-eslint/semi': ['error', 'never'],
  '@typescript-eslint/space-before-function-paren': [
    'error',
    {
      anonymous: 'always',
      asyncArrow: 'always',
      named: 'never',
    },
  ],
  // '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  'canonical/import-specifier-newline': 'off',
  'canonical/prefer-inline-type-import': 'off',
  'typescript-sort-keys/interface': 'off',
}

export default [
  // mimic ESLintRC-style extends
  ...compat.extends('canonical/auto', 'plugin:astro/recommended', 'plugin:astro/jsx-a11y-strict'),
  ...compat.config({
      overrides: [
        {
          plugins: ['prettier'],
          extends: [
            'canonical',
            'canonical/regexp',
            'canonical/jsdoc',
            'canonical/node',
            'canonical/typescript',
            'canonical/prettier',
          ],

          // Define the configuration for `.astro` file.
          files: ['**/*.astro'],
          // Allows Astro components to be parsed.
          parser: 'astro-eslint-parser',
          // Parse the script in `.astro` as TypeScript by adding the following configuration.
          // It's the setting you need when using TypeScript.
          parserOptions: {
            extraFileExtensions: ['.astro'],
            parser: '@typescript-eslint/parser',
            project: './tsconfig.json',
          },
          rules: {
            ...generalJS,
            ...ts,
            'prettier/prettier': [
              2,
              {
                ...newPrettierConfig,
                files: '*.astro',
                plugins: ['prettier-plugin-astro'],
                parser: 'astro',
              },
            ],
          },
        }
      ]
    }
  ),
  {
    files: ['**/*.js'],
    rules:
      {
        ...
          generalJS,
      }
    ,
    languageOptions: {
      globals: {
        ...
          globals.browser,
      }
      ,
      parserOptions: {
        // eslint-disable-next-line unicorn/numeric-separators-style
        ecmaVersion: 2022,
        sourceType:
          'module',
      }
      ,
    }
    ,
  }
  ,
  {
    files: ['**/*.ts'],
    languageOptions:
      {
        globals: {
          ...
            globals.browser,
        }
        ,
        parserOptions: {
          // eslint-disable-next-line unicorn/numeric-separators-style
          ecmaVersion: 2022,
          sourceType:
            'module',
          project:
            './tsconfig.json',
          tsconfigRootDir:
          __dirname,
        }
        ,
      }
    ,
    rules: {
      ...
        generalJS,
      ...
        ts,
    }
    ,
  }
  ,
  {}
]

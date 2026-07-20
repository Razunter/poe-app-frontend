import e18e from '@e18e/eslint-plugin'
import eslintCommentsPluginConfigs from '@eslint-community/eslint-plugin-eslint-comments/configs'
import jsPlugin from '@eslint/js'
import stylisticPlugin from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import * as depend from 'eslint-plugin-depend'
import importPlugin from 'eslint-plugin-import-x'
import jsdoc from 'eslint-plugin-jsdoc'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import promisePlugin from 'eslint-plugin-promise'
import regexpPlugin from 'eslint-plugin-regexp'
import unicornPlugin from 'eslint-plugin-unicorn'
import { includeIgnoreFile } from 'eslint/config'
import globals from 'globals'
import { fileURLToPath } from 'node:url'
import tsPlugin from 'typescript-eslint'
import * as astroParser from 'astro-eslint-parser'
import { configs as eslintPluginAstro } from 'eslint-plugin-astro'

// mimic CommonJS variables -- not needed if using CommonJS
const __dirname = import.meta.dirname

// ---------------------------------------------------------------------------
// generalJS — rules that apply to JS, TS, and Astro files
// ---------------------------------------------------------------------------
const generalJS = {
  'no-console': 1,
  'func-style': 2,
  // --- eslint-comments rules ---
  '@eslint-community/eslint-comments/disable-enable-pair': [2, { allowWholeFile: true }],
  '@eslint-community/eslint-comments/no-restricted-disable': 0,
  '@eslint-community/eslint-comments/no-unused-enable': 0,
  '@eslint-community/eslint-comments/no-use': 0,
  '@eslint-community/eslint-comments/require-description': 0,
  '@stylistic/padding-line-between-statements': [
    'error',
    {
      blankLine: 'always',
      prev: [
        'const',
        'let',
        'var',
        'function',
        'export',
      ],
      next: '*',
    },
    {
      blankLine: 'any', prev: ['const', 'let', 'var'], next: [
        'const',
        'let',
        'var',
        'if',
        'switch',
        'expression',
      ],
    },
  ],
  // --- @stylistic rules ---
  '@stylistic/array-bracket-newline': [
    2,
    {
      minItems: 4,
      multiline: true,
    },
  ],
  '@stylistic/array-element-newline': [
    2,
    {
      minItems: 4,
      multiline: true,
    },
  ],
  '@stylistic/arrow-parens': [2, 'always'],
  '@stylistic/brace-style': [2, '1tbs', { allowSingleLine: false }],
  '@stylistic/indent': [2, 2],
  '@stylistic/multiline-ternary': 0,
  '@stylistic/no-extra-parens': 2,
  '@stylistic/no-multiple-empty-lines': [
    2,
    {
      max: 1,
      maxBOF: 0,
      maxEOF: 1,
    },
  ],
  '@stylistic/operator-linebreak': [
    'error',
    'after',
    {
      overrides: {
        '?': 'before',
        ':': 'before',
        '|': 'before',
      },
    },
  ],
  '@stylistic/quote-props': [2, 'as-needed', { numbers: true }],
  '@stylistic/wrap-iife': [2, 'inside'],
  '@stylistic/wrap-regex': 0,
  '@stylistic/jsx-one-expression-per-line': 0,

  // --- import-x rules ---
  'import-x/no-cycle': 0, // Не удаётся заставить работать нормально
  'import-x/consistent-type-specifier-style': [2, 'prefer-inline'],
  'import-x/dynamic-import-chunkname': 0,
  'import-x/exports-last': 0,
  'import-x/extensions': [
    2,
    'never',
    {
      ignorePackages: true,
      pattern: {
        css: 'always',
        graphql: 'always',
        js: 'always',
        json: 'always',
        jsx: 'always',
        scss: 'always',
        astro: 'always',
        svg: 'always',
        ts: 'always',
        tsx: 'always',
        webp: 'always',
      },
    },
  ],
  'import-x/first': 2,
  'import-x/group-exports': 0,
  'import-x/max-dependencies': 0,
  'import-x/named': 0,
  'import-x/namespace': 0,
  'import-x/newline-after-import': 2,
  'import-x/no-absolute-path': 2,
  'import-x/no-amd': 2,
  'import-x/no-anonymous-default-export': 0,
  'import-x/no-commonjs': 0,
  'import-x/no-default-export': 0,
  'import-x/no-deprecated': 1,
  'import-x/no-duplicates': [
    2,
    {
      considerQueryString: true,
      'prefer-inline': true,
    },
  ],
  'import-x/no-dynamic-require': 2,
  'import-x/no-extraneous-dependencies': [
    2,
    {
      devDependencies: true,
      optionalDependencies: true,
      peerDependencies: true,
    },
  ],
  'import-x/no-import-module-exports': 0,
  'import-x/no-internal-modules': 0,
  'import-x/no-mutable-exports': 2,
  'import-x/no-named-as-default': 2,
  'import-x/no-named-as-default-member': 2,
  'import-x/no-named-default': 2,
  'import-x/no-named-export': 0,
  'import-x/no-namespace': 0,
  'import-x/no-nodejs-modules': 0,
  'import-x/no-relative-packages': 0,
  'import-x/no-relative-parent-imports': 0,
  'import-x/no-restricted-paths': 0,
  'import-x/no-self-import': 2,
  'import-x/no-unassigned-import': [2, { allow: ['**/*.css', '**/*.scss', '**/*.postcss'] }],
  'import-x/no-unresolved': 0,
  'import-x/no-unused-modules': 0,
  'import-x/no-useless-path-segments': [2, { noUselessIndex: true }],
  'import-x/no-webpack-loader-syntax': 2,
  'import-x/order': 0,
  'import-x/prefer-default-export': 0,
  'import-x/unambiguous': 0,

  // --- jsdoc rules ---
  'jsdoc/check-access': 2,
  'jsdoc/check-alignment': 2,
  'jsdoc/check-param-names': 2,
  'jsdoc/check-property-names': 2,
  'jsdoc/check-syntax': 2,
  'jsdoc/check-tag-names': [2, { definedTags: ['jest-environment', 'jest-environment-options'] }],

  'jsdoc/check-types': 2,
  'jsdoc/check-values': 2,
  'jsdoc/empty-tags': 2,

  'jsdoc/implements-on-classes': 2,
  'jsdoc/multiline-blocks': [
    2,
    {
      noMultilineBlocks: false,
      noSingleLineBlocks: true,
    },
  ],
  'jsdoc/no-bad-blocks': 2,
  'jsdoc/no-defaults': 2,
  'jsdoc/no-multi-asterisks': 2,
  'jsdoc/no-types': 0,
  'jsdoc/no-undefined-types': 2,
  'jsdoc/require-asterisk-prefix': 2,
  'jsdoc/require-jsdoc': 0,
  'jsdoc/require-param': 0,
  'jsdoc/require-param-description': 0,
  'jsdoc/require-param-name': 2,
  'jsdoc/require-property': 2,
  'jsdoc/require-property-description': 2,
  'jsdoc/require-property-name': 2,
  'jsdoc/require-property-type': 2,
  'jsdoc/require-returns': 0,
  'jsdoc/require-returns-check': 0,
  'jsdoc/require-returns-description': 0,
  'jsdoc/require-yields': 0,
  'jsdoc/require-yields-check': 0,
  'jsdoc/tag-lines': [2, 'never'],
  'jsdoc/valid-types': 2,
  'perfectionist/sort-imports': [
    2,
    {
      groups: [],
      ignoreCase: true,
      newlinesBetween: 0,
      type: 'natural',
    },
  ],
  'perfectionist/sort-intersection-types': 'off',
  'perfectionist/sort-maps': 'off',
  // --- perfectionist rules ---
  'perfectionist/sort-object-types': 'off',
  'perfectionist/sort-objects': 'off',
  'perfectionist/sort-union-types': 'off',
  // --- promise rules ---
  'promise/always-return': 0,
  'promise/prefer-await-to-callbacks': 0,
  'promise/prefer-await-to-then': 2,
  'promise/valid-params': 2,
  // --- unicorn rules ---
  'unicorn/prefer-continue': [
    2,
    {
      maximumStatements: 3,
    },
  ],
  'unicorn/prefer-global-this': 0,
  'unicorn/prefer-logical-operator-over-ternary': 1,
  'unicorn/consistent-function-scoping': [2, { checkArrowFunctions: false }],
  'unicorn/expiring-todo-comments': 0,
  'unicorn/filename-case': 0,
  'unicorn/import-style': 0,
  'unicorn/no-array-callback-reference': 0,
  'unicorn/no-null': 0,
  'unicorn/no-process-exit': 0,
  'unicorn/no-unused-properties': 2,
  'unicorn/no-useless-switch-case': 0,
  'unicorn/no-useless-undefined': 0,
  'unicorn/prefer-import-meta-properties': 2,
  'unicorn/prefer-prototype-methods': 0,
  'unicorn/prefer-top-level-await': 0,
  'unicorn/name-replacements': [
    2,
    {
      checkProperties: false,
      replacements: {
        args: false,
        pkg: false,
        props: false,
        ref: false,
        rel: false,
      },
    },
  ],
  'unicorn/require-post-message-target-origin': 2,
  'unicorn/consistent-boolean-name': 0, // bugged
  'unicorn/prefer-await': 0,
}

// ---------------------------------------------------------------------------
// ts — TypeScript-specific rules (apply to TS and Astro files)
// ---------------------------------------------------------------------------
const ts = {
  'no-undef': 0,
  '@typescript-eslint/await-thenable': 2,
  '@typescript-eslint/consistent-type-exports': [2, { fixMixedExportsWithInlineTypeSpecifier: true }],
  '@typescript-eslint/dot-notation': 'off',
  '@typescript-eslint/naming-convention': ['warn'],
  '@typescript-eslint/no-base-to-string': [2, { ignoredTypeNames: ['RegExp'] }],
  '@typescript-eslint/no-confusing-void-expression': [
    2,
    {
      ignoreArrowShorthand: true,
      ignoreVoidOperator: false,
    },
  ],
  '@typescript-eslint/no-extra-parens': 'off',
  '@typescript-eslint/no-floating-promises': [
    2,
    {
      ignoreIIFE: true,
      ignoreVoid: true,
    },
  ],
  '@typescript-eslint/no-for-in-array': 2,
  '@typescript-eslint/no-implied-eval': 2,
  '@typescript-eslint/no-meaningless-void-operator': [2, { checkNever: true }],
  '@typescript-eslint/no-misused-promises': [
    2,
    {
      checksConditionals: true,
      checksVoidReturn: {
        arguments: true,
        attributes: false,
        properties: true,
        returns: true,
        variables: true,
      },
    },
  ],
  '@typescript-eslint/no-unnecessary-qualifier': 2,
  '@typescript-eslint/prefer-includes': 2,
  '@typescript-eslint/prefer-nullish-coalescing': [
    1,
    {
      ignoreConditionalTests: true,
      ignoreMixedLogicalExpressions: true,
    },
  ],
  '@typescript-eslint/prefer-optional-chain': 2,
  '@typescript-eslint/prefer-readonly': [2, { onlyInlineLambdas: true }],
  '@typescript-eslint/prefer-reduce-type-parameter': 2,
  '@typescript-eslint/prefer-regexp-exec': 2,
  '@typescript-eslint/prefer-return-this-type': 2,
  '@typescript-eslint/prefer-string-starts-ends-with': 2,
  '@typescript-eslint/promise-function-async': 2,
  '@typescript-eslint/require-array-sort-compare': [2, { ignoreStringArrays: false }],
  '@typescript-eslint/return-await': [2, 'always'],
  '@typescript-eslint/switch-exhaustiveness-check': 2,
  '@typescript-eslint/unbound-method': [2, { ignoreStatic: true }],
  'import-x/consistent-type-specifier-style': 'off', // not granular enough
  'import-x/no-duplicates': 'warn',
  'perfectionist/sort-interfaces': 'off',
}

const parserOptions = {
  ecmaVersion: 'latest',
  extraFileExtensions: ['.astro'],
  parser: tsParser,
  sourceType: 'module',
  tsconfigRootDir: __dirname,
  projectService: true,
}

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default [
  includeIgnoreFile(gitignorePath, { gitignoreResolution: true }),
  // Depend plugin
  depend.configs['flat/recommended'],
  // e18e recommended

  e18e.configs.recommended,
  jsdoc.configs['flat/recommended-typescript'],
  jsPlugin.configs.recommended,
  stylisticPlugin.configs.recommended,
  importPlugin.configs['flat/recommended'],
  perfectionistPlugin.configs['recommended-natural'],
  promisePlugin.configs['flat/recommended'],
  regexpPlugin.configs['flat/recommended'],
  unicornPlugin.configs.recommended,
  eslintCommentsPluginConfigs.recommended,
  ...tsPlugin.configs.recommended,
  ...eslintPluginAstro['flat/recommended'],
  ...eslintPluginAstro['flat/jsx-a11y-recommended'],
  {
    files: ['*.astro', '**/*.astro'],
    languageOptions: {
      parser: astroParser,
      globals: {
        ...globals.browser,
      },
      parserOptions,
    },
    rules: {
      ...generalJS,
      ...ts,
      '@typescript-eslint/no-misused-promises': 'off', // broken
      'consistent-return': 'off', // broken
      'canonical/filename-match-regex': 'off',
    },
  },
  {
    files: ['**/*.js'],
    rules: { ...generalJS },
    languageOptions: {
      globals: globals.builtin,
      parserOptions,
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      ...generalJS,
      ...ts,
    },
    languageOptions: {
      globals: globals.builtin,
      parserOptions,
    },
  },
]

const generalJS = {
  'linebreak-style': ['off'],
  '@babel/no-invalid-this': ['off'],
  'canonical/id-match': ['off'],
  'object-curly-newline': [
    'error',
    {
      consistent: true,
    },
  ],
  semi: ['error', 'never'],
  'canonical/sort-keys': ['off'],
  'array-bracket-newline': [
    'error',
    {
      minItems: 4,
      multiline: true,
    },
  ],
  'array-element-newline': [
    'error',
    {
      minItems: 4,
      multiline: true,
    },
  ],
  'canonical/destructuring-property-newline': ['off'],
  '@babel/semi': ['error', 'never'],
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
}

const ts = {
  '@typescript-eslint/naming-convention': ['warn'],
  '@typescript-eslint/semi': ['error', 'never'],
  'typescript-sort-keys/interface': 'off',
  // '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  'canonical/import-specifier-newline': 'off',
  'canonical/prefer-inline-type-import': 'off',
  '@typescript-eslint/no-extra-parens': 'off',
  '@typescript-eslint/member-delimiter-style': [
    'error',
    {
      singleline: {
        delimiter: 'comma',
        requireLast: false,
      },
    },
  ],
}

module.exports = {
  extends: [
    'canonical',
    'plugin:astro/recommended',
    'plugin:astro/jsx-a11y-strict',
  ],
  rules: generalJS,
  ignorePatterns: ['*.cjs', '*.config.mjs', '**/node_modules/**'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  overrides: [
    {
      extends: ['canonical/typescript'],
      files: '*.ts',
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        ...generalJS,
        ...ts,
      },
    },
    {
      extends: [
        'canonical/react',
        'canonical/jsx-a11y',
        'canonical/typescript',
      ],
      files: '*.tsx',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      extends: ['canonical/jest'],
      files: '*.test.{ts,tsx}',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      extends: ['canonical/json'],
      files: '*.json',
    },
    {
      extends: ['canonical/yaml'],
      files: '*.yaml',
    },
    {
      extends: ['canonical/graphql'],
      files: '*.graphql',
    },
    {
      extends: ['canonical/typescript'],

      // Define the configuration for `.astro` file.
      files: ['*.astro'],
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
        'canonical/filename-match-regex': 'off',
        'import/extensions': 'off',
        '@typescript-eslint/indent': 'off',
        'import/no-unassigned-import': 'off',
        '@typescript-eslint/member-delimiter-style': 'off',
        'array-element-newline': 'off',
        'unicorn/text-encoding-identifier-case': 'off',
        'comma-dangle': 'off',
      },
    },
  ],
  root: true,
}

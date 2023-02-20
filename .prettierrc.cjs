module.exports = {
  plugins: [
    require.resolve('prettier-plugin-astro'),
    require.resolve('@trivago/prettier-plugin-sort-imports'),
  ],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
  singleQuote: true,
  semi: false,
  bracketSpacing: false,
  importOrder: [
    'path',
    '<THIRD_PARTY_MODULES>',
    '^@core/(.*)$',
    '^@server/(.*)$',
    '^@ui/(.*)$',
    '^[./]',
  ],
}

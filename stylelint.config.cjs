module.exports = {
  files: [
    '*.css',
    '**/*.css',
    '*.scss',
    '**/*.scss',
    '*.astro',
    '**/*.astro',
  ],
  extends: ['stylelint-config-standard-scss', 'stylelint-config-html/astro'],
  defaultSeverity: 'warning',
  rules: {
    'declaration-property-value-no-unknown': [
      true,
      {
        ignoreProperties: {
          background: '/^svg-load/',
        },
      },
    ],
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'no-descending-specificity': null,
    'declaration-block-no-redundant-longhand-properties': [true, {ignoreShorthands: ['grid-template', 'grid-gap']}],
    'scss/percent-placeholder-pattern': null,
  }
}

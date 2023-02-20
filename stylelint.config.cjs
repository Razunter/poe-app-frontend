module.exports = {
  files: [
    '*.css',
    '**/*.css',
    '*.scss',
    '**/*.scss',
  ],
  extends: ['stylelint-config-standard-scss', 'stylelint-config-html/astro'],
  defaultSeverity: 'warning',
  rules: {
    'declaration-property-value-no-unknown': true,
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'no-descending-specificity': null,
    'declaration-block-no-redundant-longhand-properties': [true, {ignoreShorthands: ['grid-template', 'grid-gap']}],
  }
}

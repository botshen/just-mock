import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  rules: {
    'no-use-before-define': 'off',
    'no-console': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'max-statements-per-line': 'off',
    'style/max-statements-per-line': 'off',
    'style/indent': 'off',
    'unused-imports/no-unused-vars': 'off',
  },
})

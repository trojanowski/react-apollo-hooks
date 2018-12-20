module.exports = {
  parser: 'typescript-eslint-parser',
  extends: ['react-app', 'prettier'],
  plugins: ['typescript', 'react-hooks'],
  rules: {
    curly: ['error', 'all'],
    'no-console': 'warn',
    'no-unexpected-multiline': 'warn',
    'no-unused-vars': 'off',
    'react-hooks/rules-of-hooks': 'error',
  },
};

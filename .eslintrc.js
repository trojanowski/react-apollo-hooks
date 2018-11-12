module.exports = {
  extends: ['react-app', 'prettier'],
  plugins: ['react-hooks'],
  rules: {
    curly: ['error', 'all'],
    'no-console': 'warn',
    'no-unexpected-multiline': 'warn',
    'no-unused-vars': ['error', { args: 'after-used' }],
    'react-hooks/rules-of-hooks': 'error',
  },
};

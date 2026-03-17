module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'react-native', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off', // React 17+ not needed
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  env: {
    'react-native/react-native': true,
  },
  settings: {
    react: { version: 'detect' },
  },
};

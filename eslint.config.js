import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import { fixupPluginRules } from '@eslint/compat';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['**/build/**', '**/public/**', '**/dist/**', 'src/setupTests.js', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      'jsx-a11y': fixupPluginRules(jsxA11y),
      import: importPlugin,
      prettier: prettier,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.json'],
        },
        node: { extensions: ['.js', '.jsx'] },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // Regras de Importação
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/no-self-import': 'error',

      // React / JSX
      'react/jsx-key': 'warn',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/button-has-type': 'warn',
      'react/no-children-prop': 'off',
      'react/no-array-index-key': 'off',
      'react/react-in-jsx-scope': 'off',

      // Estilo de Código
      'no-console': 'off',
      'no-unused-vars': ['warn', { ignoreRestSiblings: true }],
      'arrow-body-style': 'warn',
      'prefer-destructuring': ['warn', { object: true, array: false }],

      // Acessibilidade
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/anchor-is-valid': 'off',

      // Prettier
      ...eslintConfigPrettier.rules,
      'prettier/prettier': ['error', { endOfLine: 'auto', singleQuote: true, printWidth: 120, tabWidth: 2 }],
    },
  },
];

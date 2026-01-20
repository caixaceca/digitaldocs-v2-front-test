import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import { fixupPluginRules } from '@eslint/compat';

export default [
  {
    ignores: ['**/build/**', '**/public/**', '**/dist/**', 'src/setupTests.js', 'node_modules/**'],
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      'jsx-a11y': fixupPluginRules(jsxA11y),
      prettier: fixupPluginRules(prettier),
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      'react/prop-types': 'off',
      'react/display-name': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-new': 0,
      'no-shadow': 0,
      'no-console': 0,
      'react/jsx-key': 1,
      'arrow-body-style': 1,
      'consistent-return': 1,
      'no-param-reassign': 0,
      'no-use-before-define': 0,
      'no-underscore-dangle': 0,
      'react/button-has-type': 1,
      'react/no-children-prop': 0,
      'jsx-a11y/anchor-is-valid': 0,
      'react/no-array-index-key': 0,
      'react-hooks/rules-of-hooks': 2,
      'react-hooks/exhaustive-deps': 'warn',
      'no-promise-executor-return': 0,
      'no-unsafe-optional-chaining': 0,
      'react/require-default-props': 0,
      'react/no-unescaped-entities': 0,
      'react/jsx-props-no-spreading': 0,
      'react/jsx-filename-extension': 0,
      'react/jsx-no-useless-fragment': 0,
      'react/jsx-curly-brace-presence': 0,
      'react/destructuring-assignment': 0,
      'react/no-unstable-nested-components': 0,
      'react/function-component-definition': 0,
      'react/jsx-no-constructed-context-values': 0,
      'no-unused-vars': ['warn', { ignoreRestSiblings: false }],
      'prefer-destructuring': ['warn', { object: true, array: false }],

      ...eslintConfigPrettier.rules,
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          singleQuote: true,
          printWidth: 120,
          tabWidth: 2,
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];

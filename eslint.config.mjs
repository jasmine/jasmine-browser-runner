import { defineConfig } from 'eslint/config';
import jasmine from 'eslint-plugin-jasmine';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    // ignores in a config object by itself means "don't run eslint against
    // those files at all", which is what we want. Putting it in a config
    // object that has rules would mean "don't apply these rules to those
    // files".
    ignores: ['spec/fixtures/**/*'],
  },
  {
    extends: compat.extends('eslint:recommended'),

    files: [
      '**/*.js',
      'bin/jasmine-browser-runner',
    ],

    plugins: {
      jasmine,
    },

    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        expectAsync: 'readonly',
      },

      ecmaVersion: 2022,
      sourceType: 'commonjs',
    },

    rules: {
      quotes: ['error', 'single', {
        avoidEscape: true,
      }],

      'no-unused-vars': ['error', {
        args: 'none',
      }],

      'block-spacing': 'error',

      'comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      }],

      eqeqeq: 'error',
      'func-call-spacing': ['error', 'never'],
      'key-spacing': 'error',
      'no-tabs': 'error',
      'no-trailing-spaces': 'error',
      'no-whitespace-before-property': 'error',
      semi: ['error', 'always'],
      'space-before-blocks': 'error',
      'no-console': 'off',
      'no-var': 'error',
    },
  },
  {
    files: ['lib/support/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jasmine,
      },
    },
  },
  {
    files: ['spec/**/*.js'],

    languageOptions: {
      globals: globals.jasmine,
    },
  },
]);
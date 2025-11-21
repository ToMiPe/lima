// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Angular specific rules
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      // Angular 20 modern patterns
      '@angular-eslint/component-class-suffix': 'off', // Allow classes without Component suffix
      '@angular-eslint/directive-class-suffix': 'off',
      '@angular-eslint/prefer-standalone': 'error',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      // Prettier for templates
      'prettier/prettier': 'error',

      // Angular 20 template rules
      '@angular-eslint/template/prefer-control-flow': 'error', // Prefer @if over *ngIf
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
    },
  },
);

import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'examples/*/dist', 'coverage', 'public/r'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
  {
    // Recipes, animation presets and tokens are plain data and helpers.
    // Keep them free of React so they stay simple to test and reason about.
    files: ['registry/lib/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: 'registry/lib holds plain helpers; React belongs in ui/ or hooks/.',
              allowTypeImports: true,
            },
            {
              name: 'react-dom',
              message: 'registry/lib holds plain helpers; react-dom belongs in ui/ or hooks/.',
              allowTypeImports: true,
            },
            {
              name: 'motion/react',
              message: 'Use the core "motion" entry in registry/lib; motion/react belongs in ui/.',
            },
            {
              name: '@zag-js/react',
              message: 'registry/lib holds plain helpers; @zag-js/react belongs in ui/ or hooks/.',
            },
          ],
        },
      ],
    },
  },
);

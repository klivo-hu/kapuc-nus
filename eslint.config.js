import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

/** Node's globals, for the plain-JavaScript build scripts and shared .mjs modules. */
const nodeGlobals = {
  process: 'readonly',
  Buffer: 'readonly',
  console: 'readonly',
  URL: 'readonly',
  setTimeout: 'readonly',
};

/**
 * Flat ESLint config. `next lint` is deprecated in Next 15 and removed in 16, so the project
 * calls ESLint directly and owns its rule set.
 */
export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'data/**',
      '.seed-media/**',
      'next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // TypeScript resolves every identifier itself; ESLint's version only produces
      // false positives on DOM and Node globals.
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: nodeGlobals },
  },
);

/* Architectural boundaries are enforced here, not by convention. */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', project: './tsconfig.json' },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-refresh', 'boundaries', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
    'boundaries/elements': [
      { type: 'app',      pattern: 'src/app/**' },
      { type: 'feature',  pattern: 'src/features/*/**' },
      { type: 'platform', pattern: 'src/platform/**' },
      { type: 'service',  pattern: 'src/services/**' },
      { type: 'domain',   pattern: 'src/domain/**' },
      { type: 'shared',   pattern: 'src/shared/**' },
      { type: 'test',     pattern: 'src/test/**' },
    ],
    'boundaries/include': ['src/**/*'],
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'app',      allow: ['feature', 'service', 'platform', 'domain', 'shared'] },
        { from: 'feature',  allow: ['service', 'platform', 'domain', 'shared'] },
        { from: 'service',  allow: ['platform', 'domain', 'shared'] },
        { from: 'platform', allow: ['domain', 'shared'] },
        { from: 'domain',   allow: ['domain'] },
        { from: 'shared',   allow: ['shared'] },
        { from: 'test',     allow: ['app', 'feature', 'service', 'platform', 'domain', 'shared'] },
      ],
    }],
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['@/features/*/!(index)', '@/features/*/*/**'],
          message: "Use the feature's public API: import from '@/features/<name>'",
        },
        {
          group: ['@/platform/field-registry/fields/*'],
          message: 'Use getPlugin() from @/platform/field-registry instead of importing plugin internals',
        },
      ],
    }],
  },
  ignorePatterns: ['dist', 'node_modules', '*.cjs', '*.config.*'],
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'boundaries/element-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};

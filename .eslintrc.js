module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Prevent magic numbers - use named constants instead
    'no-magic-numbers': [
      'warn',
      {
        ignore: [-1, 0, 1, 2, 100], // Allow common numbers
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        detectObjects: false,
        enforceConst: true,
      }
    ],
    
    // Additional performance and best practice rules
    'prefer-const': 'warn',
    'no-var': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }
    ],
    
    // React-specific rules
    'react/jsx-no-bind': 'warn',
    'react/jsx-boolean-value': ['warn', 'never'],
    'react/no-array-index-key': 'warn',
    'react/no-unused-prop-types': 'warn',
    'react/prefer-stateless-function': 'warn',
    
    // React Native specific optimizations
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
  },
  overrides: [
    {
      // Allow magic numbers in test files
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**'],
      rules: {
        'no-magic-numbers': 'off',
      },
    },
    {
      // Allow magic numbers in configuration files
      files: ['*.config.{js,ts}', 'metro.config.js', 'babel.config.js'],
      rules: {
        'no-magic-numbers': 'off',
      },
    },
    {
      // Stricter rules for TypeScript files
      files: ['**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: false,
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          }
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
};

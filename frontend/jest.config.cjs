module.exports = {
    moduleFileExtensions: ['js', 'mjs', 'json', 'vue'],
    transform: {
      '^.+\\.vue$': '@vue/vue3-jest',
      '^.+\\.(js|mjs)$': 'babel-jest',
      ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
    },
    testEnvironment: 'jest-environment-jsdom',
    testEnvironmentOptions: {
      customExportConditions: ["node", "node-addons"],
    },
    testPathIgnorePatterns: ['/node_modules/', '/test/e2e/', '/e2e/'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.(css|less|scss|sass|png)$': 'identity-obj-proxy',
    },
    transformIgnorePatterns: ['/node_modules/(?!.*perfect-debounce)'],
    setupFilesAfterEnv: ['./jest.setup.js'],
    coverageReporters: ['json-summary'],
    coveragePathIgnorePatterns: ['<rootDir>/scripts/'],
  };
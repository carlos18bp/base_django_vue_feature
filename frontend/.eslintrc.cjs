module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "coverage/",
    "coverage-e2e/",
    "playwright-report/",
    "test-results/",
  ],
  rules: {},
};

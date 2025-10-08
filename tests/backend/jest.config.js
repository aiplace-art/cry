module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/backend/**/*.js',
    '!src/backend/server.js',
    '!src/backend/node_modules/**'
  ],
  testMatch: [
    '**/tests/backend/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/backend/setup.js'],
  testTimeout: 10000,
  verbose: true
};

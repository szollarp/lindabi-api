import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  coveragePathIgnorePatterns: [
    'src/routes.ts',
  ],
  testMatch: [
    'tests/integration/**/*.ts',
    'tests/unit/**/*.ts',
  ],
};

export default config;
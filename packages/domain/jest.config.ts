import type { Config } from 'jest';

const config: Config = {
    rootDir: '.',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/src/**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@igniter/domain/provider$': '<rootDir>/packages/domain/src/provider',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.json',
                diagnostics: false,
            },
        ],
    },
};

export default config;
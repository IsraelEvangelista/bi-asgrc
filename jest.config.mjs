/** @type {import('jest').Config} */
export default {
  // Ambiente de teste
  testEnvironment: 'jsdom',
  
  // Setup de arquivos antes dos testes
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Padrões para encontrar arquivos de teste
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Excluir arquivos que não são testes
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  
  // Transformações de arquivos
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.json'
    }]
  },
  
  // Arquivos para coletar coverage
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.*',
    '!src/**/*.spec.*',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  
  // Configurações de coverage
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Mocks automáticos e mapeamento de módulos
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Resolver extensões
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Configuração para ESM
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx']
};
module.exports = {
    testMatch: [
      '**/pages/**/*.{test.js, test.jsx}',
      '**/?(*.)+(spec|test).[tj]s?(x)'       
    ],
    testPathIgnorePatterns: [
      '/node_modules/',  
    ],
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      }
    
  };
  
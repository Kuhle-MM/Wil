module.exports = {
  preset: 'react-native',

  // Fix 1 (from last time): Compile 'export' statements
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-ble-plx)/)',
  ],

  // Fix 2 (new): Use our new mock file before tests
  setupFilesAfterEnv: ['./jest.setup.js'],
};
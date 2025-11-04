module.exports = {
  preset: 'react-native',

  // Fix 1: Add 'react-native-vector-icons' to this list
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-ble-plx|react-native-vector-icons)/)',
  ],

  // Fix 2 (from last time): Use our new mock file before tests
  setupFilesAfterEnv: ['./jest.setup.js'],
};
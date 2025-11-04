module.exports = {
  preset: 'react-native',

  // Fix 1: Add 'react-native-progress' to this list
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-ble-plx|react-native-vector-icons|react-native-progress)/)',
  ],

  // Fix 2: Use our mock file
  setupFilesAfterEnv: ['./jest.setup.js'],
};
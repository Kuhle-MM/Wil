// jest.setup.js

// 1. Mock AsyncStorage (the one that's crashing now)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// 2. Mock BLE-PLX (this would have been your next crash)
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => ({
    createClient: jest.fn(),
    // Add other methods you use here
  })),
}));

// 3. Mock react-native-camera
jest.mock('react-native-camera', () => ({
  RNCamera: {
    Constants: {
      Type: { back: 'back', front: 'front' },
      FlashMode: { on: 'on', off: 'off', auto: 'auto' },
      BarCodeType: { qr: 'qr' },
    },
  },
}));

// 4. Mock react-native-permissions
jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);

// 5. Mock vision-camera
jest.mock('react-native-vision-camera', () => ({
  useCameraDevice: jest.fn(),
  useFrameProcessor: jest.fn(),
  Camera: jest.fn(),
}));

// 6. Mock react-native-gesture-handler (often needed)
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    View: View,
    NativeButton: View,
    TouchableOpacity: View,
    TouchableHighlight: View,
    TouchableNativeFeedback: View,
    TouchableWithoutFeedback: View,
    GestureHandlerRootView: View,
  };
});

// 7. Mock reanimated
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  useSharedValue: jest.fn,
  useAnimatedStyle: jest.fn,
  withTiming: jest.fn,
  withSpring: jest.fn,
}));

// 8. Mock react-native-vector-icons
// This is the file that's crashing: AuthScreen.tsx imports Ionicons
jest.mock('react-native-vector-icons/Ionicons', () => {
  // Mock it as a simple string or a "component"
  return 'Icon';
});
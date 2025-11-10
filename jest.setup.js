// jest.setup.js

// --- We're mocking every native module from your package.json ---

// 1. AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// 2. BLE-PLX
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => ({
    createClient: jest.fn(),
    // ... add any other methods your app uses
  })),
}));

// 3. react-native-camera
jest.mock('react-native-camera', () => ({
  RNCamera: {
    Constants: {
      Type: { back: 'back', front: 'front' },
      FlashMode: { on: 'on', off: 'off', auto: 'auto' },
      BarCodeType: { qr: 'qr' },
    },
  },
}));

// 4. react-native-permissions
jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);

// 5. REMOVED react-native-vision-camera mock because it was uninstalled

// 6. react-native-gesture-handler
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

// 7. reanimated
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  useSharedValue: jest.fn,
  useAnimatedStyle: jest.fn,
  withTiming: jest.fn,
  withSpring: jest.fn,
}));

// 8. react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/AntDesign', () => 'Icon');
// Add any other icon sets you use here

// 9. react-native-progress
jest.mock('react-native-progress', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return { Bar: View, Circle: View, Pie: View };
});

// 10. react-native-qrcode-scanner
jest.mock('react-native-qrcode-scanner', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return View;
});

// 11. react-native-get-random-values
jest.mock('react-native-get-random-values', () => ({
  getRandomBase64: jest.fn(),
}));

// 12. @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return View;
});

// 13. @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return View;
});

// 14. react-native-safe-area-context
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock'),
);

// 15. react-native-screens
jest.mock('react-native-screens', () => ({
  ...jest.requireActual('react-native-screens'),
  enableScreens: jest.fn(),
}));

// 16. react-native-svg
jest.mock('react-native-svg', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    ...jest.requireActual('react-native-svg'),
    Svg: View,
    Path: View, // Mock specific SVG components you use
    Circle: View,
    Rect: View,
  };
});

// 17. Mock Navigation Hooks
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// 18. Mock Native Stack Navigator
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => {
      const React = require('react');
      return <>{children}</>; // Just render the children (the screens)
    },
    Screen: () => null,
  }),
}));

// 19. Mock Bottom Tab Navigator
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => {
      const React = require('react');
      return <>{children}</>; // Just render the children
    },
    Screen: () => null,
  }),
}));

// --- ADDED MOCKS TO FIX YOUR CRASH ---

// 20. Mock react-native-fs (Fixes the NativeEventEmitter crash)
jest.mock('react-native-fs', () => ({
  mkdir: jest.fn(),
  moveFile: jest.fn(),
  copyFile: jest.fn(),
  pathForBundle: jest.fn(),
  pathForGroup: jest.fn(),
  getFSInfo: jest.fn(),
  getAllExternalFilesDirs: jest.fn(),
  unlink: jest.fn(),
  exists: jest.fn(),
  stopDownload: jest.fn(),
  resumeDownload: jest.fn(),
  isResumable: jest.fn(),
  stopUpload: jest.fn(),
  completeHandlerIOS: jest.fn(),
  readDir: jest.fn(),
  read: jest.fn(),
  readFile: jest.fn(),
  readFileAssets: jest.fn(),
  hash: jest.fn(),
  copyFileAssets: jest.fn(),
  copyFileAssetsIOS: jest.fn(),
  copyAssetsVideoIOS: jest.fn(),
  writeFile: jest.fn(),
  appendFile: jest.fn(),
  write: jest.fn(),
  downloadFile: jest.fn(),
  uploadFiles: jest.fn(),
  touch: jest.fn(),
  MainBundlePath: '',
  CachesDirectoryPath: '',
  DocumentDirectoryPath: '',
  ExternalDirectoryPath: '',
  ExternalStorageDirectoryPath: '',
  TemporaryDirectoryPath: '',
  LibraryDirectoryPath: '',
  PicturesDirectoryPath: '',
}));

// 21. Mock react-native-share (This would crash next)
jest.mock('react-native-share', () => ({
  default: jest.fn(),
}));

// 22. Mock xlsx (Fixes the "Cannot find module 'xlsx'" crash)
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({
      SheetNames: [],
      Sheets: {},
    })),
    book_append_sheet: jest.fn(),
    json_to_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));
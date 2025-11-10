import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  AppState,
  ActivityIndicator,
  PermissionsAndroid, 
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import { RootTabParamList } from './types'; 

// --- Configuration ---
const API_BASE_URL = "https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net";
const PING_TARGET = 3; 
const PING_COOLDOWN_MS = 30000; 

type BLEReceiverRouteProp = RouteProp<RootTabParamList, 'BLEReceiver'>;
const bleManager = new BleManager();

const BLEReceiver: React.FC = () => {
  const route = useRoute<BLEReceiverRouteProp>();
  const { lessonID, studentNumber } = route.params || {};

  const [status, setStatus] = useState('Initializing BLE...');
  const [pingCount, setPingCount] = useState(0); // This is now our source of truth
  const lastPingTimeRef = useRef<number>(0);
  const appState = useRef(AppState.currentState);

  // ... (useEffect, requestPermissions, startScan are unchanged) ...
  
  useEffect(() => {
    if (!lessonID || !studentNumber) {
      setStatus('Error: Missing Lesson or Student ID.');
      Alert.alert('Navigation Error', 'Missing data. Please go back and try again.');
      return;
    }
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        startScan(); 
      }
      appState.current = nextAppState;
    });
    const bleStateSubscription = bleManager.onStateChange(state => {
      if (state === 'PoweredOn') {
        startScan();
      } else {
        setStatus('Bluetooth is not powered on.');
        bleManager.stopDeviceScan();
      }
    }, true); 
    return () => {
      appStateSubscription.remove();
      bleStateSubscription.remove();
      bleManager.stopDeviceScan();
    };
  }, [lessonID, studentNumber]); 

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') { return true; }
    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return (
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    return false;
  };

  const startScan = async () => {
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) {
      Alert.alert('Permissions required', 'Bluetooth permissions are required to verify attendance.');
      setStatus('Bluetooth permissions denied.');
      return;
    }
    const bleState = await bleManager.state();
    if (bleState !== State.PoweredOn) {
      setStatus('Please turn on Bluetooth.');
      return;
    }
    scanForDevice();
  };
  
  const scanForDevice = () => {
    if (pingCount >= PING_TARGET) {
      setStatus(`Attendance confirmed. (${PING_TARGET}/${PING_TARGET} pings)`);
      bleManager.stopDeviceScan();
      return;
    }

    setStatus(`Scanning for lesson ${lessonID}... (${pingCount}/${PING_TARGET})`);
    
    bleManager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setStatus(`Error: ${error.message}`);
        bleManager.stopDeviceScan();
        return;
      }

      if (device && device.name === lessonID) {
        console.log(`Found device: ${device.name}`);
        handleDeviceFound();
      }
    });
  };

  const handleDeviceFound = async () => {
    const now = Date.now();
    if (now - lastPingTimeRef.current < PING_COOLDOWN_MS) {
      console.log('Device found, but in cooldown period.');
      return;
    }
    lastPingTimeRef.current = now; 
    bleManager.stopDeviceScan(); 
    
    // Pass the *current* pingCount (which is 0 on the first run)
    await sendApiRequest(pingCount);
  };

  // --- MODIFIED API LOGIC ---
  const sendApiRequest = async (currentPingCount: number) => {
    let url = "";
    let options: RequestInit = {};

    try {
      if (currentPingCount === 0) {
        // --- 1. FIRST PING: Clock the user in ---
        console.log(`Sending FIRST ping (Clock-in) for ${studentNumber}`);
        setStatus('Device found. Clocking in...');
        
        url = `${API_BASE_URL}/Lesson/clockin/${studentNumber}/${lessonID}`;
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        };

      } else {
        // --- 2. SUBSEQUENT PINGS: Update report status ---
        console.log(`Sending ping ${currentPingCount + 1} for ${studentNumber}`);
        setStatus(`Device found. Sending ping ${currentPingCount + 1}/${PING_TARGET}...`);
        
        // --- THIS IS THE 404 FIX ---
        // PingingController has [Route("api/[controller]")]
        url = `${API_BASE_URL}/api/Pinging/ReceiveReactPing`; 
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            LessonId: lessonID,
            StudentNumber: studentNumber,
          }),
        };
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API error: ${response.status} - ${text}`);
      }

      const newPingCount = currentPingCount + 1;
      setPingCount(newPingCount); // Increment count *after* successful API call

      // Check if we are done
      if (newPingCount >= PING_TARGET) {
        setStatus(`Attendance confirmed. (${PING_TARGET}/${PING_TARGET} pings)`);
      } else {
        // Not done, restart scan
        setStatus(`Ping ${newPingCount}/${PING_TARGET} sent. Rescanning...`);
        setTimeout(scanForDevice, 1000);
      }

    } catch (error) {
      console.error('API Ping failed:', error);
      setStatus('Ping failed. Retrying scan...');
      // Restart scan even on failure
      setTimeout(scanForDevice, 5000); 
    }
  };


  return (
    <View style={styles.container}>
      {pingCount < PING_TARGET ? (
         <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Text style={{fontSize: 72}}>✅</Text> 
      )}
      <Text style={styles.statusText}>{status}</Text>
      <Text style={styles.infoText}>
        Verifying attendance for Lesson {lessonID}...
      </Text>
      <Text style={styles.subText}>
        This process is automatic. Please keep the app open.
      </Text>
    </View>
  );
};

// Styles (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E', 
    padding: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 10,
  },
  subText: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default BLEReceiver;
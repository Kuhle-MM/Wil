// --- Polyfills (at top of your app's entry file, e.g., index.js or App.tsx) ---
import 'react-native-get-random-values';
import { verifySignature } from './verifySignature';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
// --- End Polyfills ---


import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { BleManager, State as BleState, Device } from 'react-native-ble-plx';
import crypto from 'react-native-quick-crypto';


// --- Type Definitions ---
interface PublicKeyMap {
  [key: string]: string;
}


interface VerifiedInfo {
  deviceId: string;
  room: string;
  timestamp: number;
}


// --- Configuration ---
const PUBLIC_KEYS: PublicKeyMap = {
    // IMPORTANT: Replace with the actual public key from your ESP32 device.
    // This must be the uncompressed hex string (0x04 + X + Y).
  "LR001": "04b1...REPLACE_WITH_REAL_PUBLIC_KEY_HEX...",
};




// --- BLE Verification Logic ---


/**
 * Converts a DER-encoded signature in hex format to a raw (r,s) format.
 */
function derSignatureHexToRaw(derHex: string): Buffer {
    const der = Buffer.from(derHex, 'hex');
    if (der[0] !== 0x30) throw new Error('Not a DER sequence.');
    let offset = 4;
    let rLength = der[3];
    let rStart = offset;
    if (der[rStart] === 0x00 && (der[rStart + 1] & 0x80) !== 0) {
        rLength--;
        rStart++;
    }
    offset += rLength + 2;
    let sLength = der[offset - 1];
    let sStart = offset;
    if (der[sStart] === 0x00 && (der[sStart + 1] & 0x80) !== 0) {
        sLength--;
        sStart++;
    }
    const r = der.slice(rStart, rStart + rLength);
    const s = der.slice(sStart, sStart + sLength);
    const rawR = Buffer.alloc(32);
    r.copy(rawR, 32 - r.length);
    const rawS = Buffer.alloc(32);
    s.copy(rawS, 32 - s.length);
    return Buffer.concat([rawR, rawS]);
}

// --- React Native Component ---
type AppState = 'IDLE' | 'SCANNING' | 'VERIFYING' | 'VERIFIED' | 'ERROR';


const BLEReceiver = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [verifiedInfo, setVerifiedInfo] = useState<VerifiedInfo | null>(null);
 
  const bleManager = useMemo(() => new BleManager(), []);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Cleanup on component unmount
  useEffect(() => {
    return () => {
        bleManager.destroy();
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
        }
    };
  }, [bleManager]);




  const addLog = (message: string) => {
    console.log(message);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs].slice(0, 100));
  };


  const stopScan = () => {
    bleManager.stopDeviceScan();
  };


  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
        return true;
    }
   
    // Request permissions based on Android API level
    const requiredPermissions = Platform.Version >= 31
        ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
        : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
   
    const statuses = await PermissionsAndroid.requestMultiple(requiredPermissions);
    const allGranted = requiredPermissions.every(p => statuses[p] === PermissionsAndroid.RESULTS.GRANTED);


    if (!allGranted) {
        addLog('Permissions denied. Cannot scan.');
        return false;
    }
    return true;
  };


  const handleDeviceFound = async (device: Device) => {
      if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
      }
      stopScan();
      addLog(`Found device: ${device.name}.`);
      setAppState('VERIFYING');


      if (!device.manufacturerData) {
          addLog("Error: No manufacturer data found.");
          setAppState('ERROR');
          return;
      }


      const manufacturerData = Buffer.from(device.manufacturerData, 'base64');
      const advString = manufacturerData.slice(2).toString('utf-8');
      addLog(`Received data: ${advString}`);
     
      const parts = advString.split('|');
      if (parts.length !== 3) {
          addLog(`Error: Invalid data format. Expected "room|ts|sig"`);
          setAppState('ERROR');
          return;
      }


      const [room, tsStr, sigHex] = parts;
      const ts = parseInt(tsStr, 10);
      const pub = PUBLIC_KEYS[room];


      if (!pub) {
          addLog(`Error: No public key for room "${room}".`);
          setAppState('ERROR');
          return;
      }


      addLog(`Verifying signature for room: ${room}...`);
      const ok = await verifySignature(pub, room, ts, sigHex);


      if (ok) {
          addLog('Signature VERIFIED!');
          const now = Math.floor(Date.now() / 1000);
          if (Math.abs(now - ts) <= 120) {
              addLog('Timestamp is fresh.');
              setVerifiedInfo({ deviceId: device.id, room, timestamp: ts });
              setAppState('VERIFIED');
          } else {
              addLog(`Stale timestamp detected. Device: ${ts}, App: ${now}`);
              setAppState('ERROR');
          }
      } else {
          addLog('Signature verification FAILED!');
          setAppState('ERROR');
      }
  }


  const startVerificationFlow = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
        setAppState('ERROR');
        return;
    }
   
    const bleState = await bleManager.state();
    if (bleState !== BleState.PoweredOn) {
        addLog(`Bluetooth is not enabled. Current state: ${bleState}`);
        setAppState('ERROR');
        return;
    }


    setAppState('SCANNING');
    setLogs([]);
    setVerifiedInfo(null);
    addLog('Starting verification...');


    bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
        if (error) {
            addLog(`Scan Error: ${error.message}`);
            setAppState('ERROR');
            stopScan();
            return;
        }


        if (device && device.name === 'ESP32_ATTEND') {
            handleDeviceFound(device);
        }
    });


    // Set a timeout to stop scanning after 30 seconds if no device is found
    scanTimeoutRef.current = setTimeout(() => {
        // Use functional update to safely check the state and avoid race conditions
        setAppState(currentState => {
            if (currentState === 'SCANNING') {
                stopScan();
                addLog("Scan timed out after 30 seconds.");
                return 'IDLE';
            }
            // If state has changed (e.g., to VERIFYING), do nothing.
            return currentState;
        });
    }, 30000);
  };


  const resetApp = () => {
    stopScan();
    setLogs([]);
    setVerifiedInfo(null);
    setAppState('IDLE');
  };


  const renderContent = () => {
    switch (appState) {
      case 'SCANNING':
        return (
          <>
            <Text style={styles.statusText}>Searching for ESP32 device...</Text>
            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={resetApp}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        );
      case 'VERIFYING':
        return <Text style={styles.statusText}>Found device, verifying...</Text>;
      case 'VERIFIED':
        return (
          verifiedInfo && (
            <>
              <Text style={styles.titleSuccess}>Verification Successful!</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Room:</Text> {verifiedInfo.room}</Text>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Device ID:</Text> {verifiedInfo.deviceId}</Text>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Timestamp:</Text> {new Date(verifiedInfo.timestamp * 1000).toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.button} onPress={resetApp}>
                <Text style={styles.buttonText}>Verify Another</Text>
              </TouchableOpacity>
            </>
          )
        );
      case 'ERROR':
        return (
          <>
            <Text style={styles.titleError}>Verification Failed</Text>
            <TouchableOpacity style={styles.button} onPress={resetApp}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return (
          <>
            <TouchableOpacity style={styles.button} onPress={startVerificationFlow}>
              <Text style={styles.buttonText}>Scan & Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#10B981', marginTop: 12 }]}
              onPress={() => {
                addLog('Running manual verification test...');
                startVerificationFlow();
              }}
            >
              <Text style={styles.buttonText}>Test Verification</Text>
            </TouchableOpacity>
          </>
        );

    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLE Attendance Verifier</Text>
        <Text style={styles.headerStatus}>Status: {appState}</Text>
      </View>
      <View style={styles.mainContent}>
        {renderContent()}
      </View>
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Logs</Text>
        <ScrollView style={styles.logScrollView} contentContainerStyle={{flexGrow: 1}}>
            <Text style={styles.logText}>{logs.join('\n')}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1E293B' },
  headerStatus: { textAlign: 'center', color: '#64748B', marginTop: 4 },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  statusText: { fontSize: 18, color: '#475569' },
  button: { backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, marginTop: 24, minWidth: 150, alignItems: 'center' },
  buttonCancel: { backgroundColor: '#EF4444' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  titleSuccess: { fontSize: 24, fontWeight: 'bold', color: '#16A34A', marginBottom: 16 },
  titleError: { fontSize: 24, fontWeight: 'bold', color: '#DC2626', marginBottom: 16 },
  infoBox: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1, borderRadius: 8, padding: 16, width: '100%' },
  infoText: { fontSize: 16, color: '#166534', marginBottom: 4 },
  infoLabel: { fontWeight: '600' },
  logContainer: { height: 200, backgroundColor: 'white', margin: 16, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 5 },
  logTitle: { fontSize: 18, fontWeight: 'bold', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', color: '#334155'},
  logScrollView: { flex: 1 },
  logText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: '#475569', padding: 12 },
});


export default BLEReceiver;

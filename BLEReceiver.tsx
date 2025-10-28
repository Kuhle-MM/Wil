import React, { useState, useMemo, useEffect } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, ScrollView, PermissionsAndroid, Platform, ActivityIndicator
} from 'react-native';
import { BleManager, State as BleState, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

// --- Polyfills (keep these at the top of your entry file or here) ---
import 'react-native-get-random-values';
global.Buffer = Buffer;

// --- You will need to implement this verification function ---
// import { verifySignature } from './verifySignature'; 

// ================== CONFIGURATION ==================
// These MUST match the UUIDs in your ESP32 code
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

const PUBLIC_KEYS: { [key: string]: string } = {
  // IMPORTANT: You must get the public key from your ESP32's serial monitor on boot
  // and paste it here. This is a placeholder.
  "LR001": "04...REPLACE_WITH_REAL_PUBLIC_KEY_HEX...",
};
// =====================================================

// --- Type Definitions ---
type AppState = 'IDLE' | 'SCANNING' | 'CONNECTING' | 'READING' | 'VERIFIED' | 'ERROR';
interface VerifiedInfo {
  deviceId: string;
  room: string;
  timestamp: number;
}
// This is a placeholder for your actual verification function
// For now, it will always return true for testing purposes.
const verifySignature = async (pubKeyHex: string, room: string, timestamp: number, sigHex: string): Promise<boolean> => {
    console.log("Pretending to verify signature...");
    // In your real app, you would implement the full crypto verification here.
    return true; 
};


const BLEReceiver = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [verifiedInfo, setVerifiedInfo] = useState<VerifiedInfo | null>(null);
  
  const bleManager = useMemo(() => new BleManager(), []);
  
  useEffect(() => {
    // This cleanup function is called when the component unmounts
    return () => {
      bleManager.destroy();
    };
  }, [bleManager]);

  const addLog = (message: string) => {
    console.log(message);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs].slice(0, 100));
  };

  const startVerificationFlow = async () => {
    // 1. Reset state and request permissions
    setAppState('IDLE');
    setLogs([]);
    setVerifiedInfo(null);
    addLog('Starting verification...');

    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            { title: 'Location Permission', message: 'BLE needs location access', buttonPositive: 'OK', buttonNegative: 'Cancel' }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            addLog('Location permission denied');
            setAppState('ERROR');
            return;
        }
    }

    const bleState = await bleManager.state();
    if (bleState !== BleState.PoweredOn) {
      addLog(`Bluetooth is not enabled. Current state: ${bleState}`);
      setAppState('ERROR');
      return;
    }
    
    // 2. Scan for the specific service
    setAppState('SCANNING');
    addLog(`Scanning for service: ${SERVICE_UUID}`);
    bleManager.startDeviceScan([SERVICE_UUID], null, async (error, device) => {
      if (error || !device) {
        addLog(`Scan Error: ${error?.message}`);
        setAppState('ERROR');
        bleManager.stopDeviceScan();
        return;
      }

      bleManager.stopDeviceScan();
      addLog(`Found device: ${device.name} (${device.id})`);
      let connectedDevice: Device | null = null;

      try {
        // 3. Connect to the device
        setAppState('CONNECTING');
        addLog('Connecting to device...');
        connectedDevice = await device.connect();
        addLog('Connected. Discovering services...');

        await connectedDevice.discoverAllServicesAndCharacteristics();
        addLog('Services discovered.');

        // 4. Read the characteristic value
        setAppState('READING');
        addLog('Reading characteristic...');
        const characteristic = await connectedDevice.readCharacteristicForService(
            SERVICE_UUID,
            CHARACTERISTIC_UUID
        );
        
        if (!characteristic?.value) {
            throw new Error("Characteristic value is null.");
        }

        const signedMessage = Buffer.from(characteristic.value, 'base64').toString('utf-8');
        addLog(`Received data: ${signedMessage}`);
        
        // 5. Verify the signature and timestamp
        const parts = signedMessage.split('|');
        if (parts.length !== 3) throw new Error('Invalid data format');
        
        const [room, tsStr, sigHex] = parts;
        const ts = parseInt(tsStr, 10);
        const pubKey = PUBLIC_KEYS[room];

        if (!pubKey) throw new Error(`No public key for room "${room}"`);

        addLog(`Verifying signature for room: ${room}...`);
        const isVerified = await verifySignature(pubKey, room, ts, sigHex);

        if (isVerified) {
          addLog('Signature VERIFIED!');
          setVerifiedInfo({ deviceId: device.id, room, timestamp: ts });
          setAppState('VERIFIED');
        } else {
          throw new Error('Signature verification FAILED!');
        }

      } catch (e: any) {
        addLog(`Error: ${e.message}`);
        setAppState('ERROR');
      } finally {
        // 6. Disconnect from the device
        if (connectedDevice) {
            addLog('Disconnecting...');
            await connectedDevice.cancelConnection();
            addLog('Disconnected.');
        }
      }
    });
  };

    const resetApp = () => {
        bleManager.stopDeviceScan();
        setLogs([]);
        setVerifiedInfo(null);
        setAppState('IDLE');
    };

  const renderContent = () => {
    switch (appState) {
        case 'SCANNING':
        case 'CONNECTING':
        case 'READING':
            return (
                <>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.statusText}>{appState}...</Text>
                </>
            );
        case 'VERIFIED':
            return (
                verifiedInfo && (
                    <>
                        <Text style={styles.titleSuccess}>Verification Successful!</Text>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}><Text style={styles.infoLabel}>Room:</Text> {verifiedInfo.room}</Text>
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
        default: // IDLE
            return (
                <TouchableOpacity style={styles.button} onPress={startVerificationFlow}>
                    <Text style={styles.buttonText}>Scan & Verify</Text>
                </TouchableOpacity>
            );
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLE Verifier</Text>
        <Text style={styles.headerStatus}>Status: {appState}</Text>
      </View>
      <View style={styles.mainContent}>
        {renderContent()}
      </View>
      <ScrollView style={styles.logContainer} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
        <Text style={styles.logText}>{logs.join('\n')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
 screen: { flex: 1, backgroundColor: '#F1F5F9' },
 header: { backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
 headerTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1E293B' },
 headerStatus: { textAlign: 'center', color: '#64748B', marginTop: 4 },
 mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
 statusText: { fontSize: 18, color: '#475569', marginTop: 16 },
 button: { backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, marginTop: 24, minWidth: 150, alignItems: 'center' },
 buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
 titleSuccess: { fontSize: 24, fontWeight: 'bold', color: '#16A34A', marginBottom: 16 },
 titleError: { fontSize: 24, fontWeight: 'bold', color: '#DC2626', marginBottom: 16 },
 infoBox: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1, borderRadius: 8, padding: 16, width: '100%' },
 infoText: { fontSize: 16, color: '#166534', marginBottom: 4 },
 infoLabel: { fontWeight: '600' },
 logContainer: { flex: 1, backgroundColor: '#0D1117', margin: 16, borderRadius: 8 },
 logText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: '#C9D1D9', padding: 12 },
});


export default BLEReceiver;
import React, { useState, useMemo, useEffect } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, ScrollView, PermissionsAndroid, Platform, ActivityIndicator
} from 'react-native';
import { BleManager, State as BleState, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

import 'react-native-get-random-values';

global.Buffer = Buffer;

// ================== CONFIG ==================
// These UUIDs MUST match your NotifyBeacon.ino file
const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcd1234-5678-90ab-cdef-1234567890ab";
// =====================================================

// Types
type AppState = 'IDLE' | 'SCANNING' | 'CONNECTING' | 'READING' | 'READ_SUCCESS' | 'ERROR';
interface ReadInfo {
  deviceId: string;
  deviceName: string;
  message: string;
}

const SimpleNotifyReceiver = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [readInfo, setReadInfo] = useState<ReadInfo | null>(null);

  const bleManager = useMemo(() => new BleManager(), []);

  useEffect(() => {
    return () => {
      bleManager.destroy();
    };
  }, [bleManager]);

  const addLog = (message: string) => {
    console.log(message);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 200));
  };

  const requestPermissionsIfNeeded = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        { title: 'Location Permission', message: 'BLE needs location access', buttonPositive: 'OK', buttonNegative: 'Cancel' }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startScanAndRead = async () => {
    setAppState('IDLE');
    setLogs([]);
    setReadInfo(null);
    addLog('Starting scan...');

    const okPerm = await requestPermissionsIfNeeded();
    if (!okPerm) {
      addLog('Location permission denied');
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
    addLog(`Scanning for service: ${SERVICE_UUID}`);
    bleManager.startDeviceScan([SERVICE_UUID], null, async (error, device) => {
      if (error) {
        addLog(`Scan error: ${error.message}`);
        setAppState('ERROR');
        bleManager.stopDeviceScan();
        return;
      }
      if (!device) return;

      // Stop scanning once we have a device
      bleManager.stopDeviceScan();
      addLog(`Found device: ${device.name ?? 'Unknown'} (${device.id})`);
      let connectedDevice: Device | null = null;

      try {
        setAppState('CONNECTING');
        addLog('Connecting to device...');
        connectedDevice = await device.connect();
        addLog('Connected. Discovering services...');
        await connectedDevice.discoverAllServicesAndCharacteristics();
        addLog('Services discovered.');

        setAppState('READING');
        addLog('Reading characteristic...');
        const characteristic = await connectedDevice.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID);
        if (!characteristic?.value) throw new Error("Characteristic value is null.");
        
        // Decode the value from Base64 to a readable string
        const message = Buffer.from(characteristic.value, 'base64').toString('utf-8');
        addLog(`Received data: "${message}"`);

        // Success!
        setReadInfo({
          deviceId: device.id,
          deviceName: device.name ?? 'NotifyBeacon',
          message: message
        });
        setAppState('READ_SUCCESS');

      } catch (e: any) {
        addLog(`Error: ${e?.message ?? e}`);
        setAppState('ERROR');
      } finally {
        if (connectedDevice) {
          addLog('Disconnecting...');
          try { await connectedDevice.cancelConnection(); } catch (_) {}
          addLog('Disconnected.');
        }
      }
    });
  };

  const resetApp = () => {
    try { bleManager.stopDeviceScan(); } catch(_) {}
    setLogs([]);
    setReadInfo(null);
    setAppState('IDLE');
  };

  const renderContent = () => {
    switch (appState) {
      case 'SCANNING':
      case 'CONNECTING':
      case 'READING':
        return (<><ActivityIndicator size="large" /><Text style={styles.statusText}>{appState}...</Text></>);
      case 'READ_SUCCESS':
        return readInfo && (<>
          <Text style={styles.titleSuccess}>Read Successful!</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}><Text style={styles.infoLabel}>Device:</Text> {readInfo.deviceName}</Text>
            <Text style={styles.infoText}><Text style={styles.infoLabel}>Message:</Text> "{readInfo.message}"</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={resetApp}><Text style={styles.buttonText}>Scan Again</Text></TouchableOpacity>
        </>);
      case 'ERROR':
        return (<><Text style={styles.titleError}>Failed</Text><TouchableOpacity style={styles.button} onPress={resetApp}><Text style={styles.buttonText}>Try Again</Text></TouchableOpacity></>);
      default:
        return (<TouchableOpacity style={styles.button} onPress={startScanAndRead}><Text style={styles.buttonText}>Scan & Read</Text></TouchableOpacity>);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLE Reader</Text>
        <Text style={styles.headerStatus}>Status: {appState}</Text>
      </View>
      <View style={styles.mainContent}>{renderContent()}</View>
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
  logText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: '#C9D1D9', padding: 12 }
});

export default SimpleNotifyReceiver;

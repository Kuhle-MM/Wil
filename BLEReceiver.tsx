import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, ScrollView, PermissionsAndroid, Platform, ActivityIndicator
} from 'react-native';
import { BleManager, State as BleState, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import 'react-native-get-random-values';

global.Buffer = Buffer;

// ================== CONFIG ==================
const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcd1234-5678-90ab-cdef-1234567890ab";

// Ping schedule (in milliseconds)
const FIRST_PING_DELAY = 0;              // Start immediately
const FIRST_PING_DURATION = 10 * 60 * 1000; // 10 minutes
const SECOND_PING_DELAY = FIRST_PING_DURATION + (5 * 60 * 1000); // 5 mins after first
const THIRD_PING_DELAY = SECOND_PING_DELAY + (5 * 60 * 1000);    // another 5 mins
// =====================================================

type AppState = 'IDLE' | 'WAITING' | 'SCANNING' | 'CONNECTING' | 'READING' | 'READ_SUCCESS' | 'ERROR' | 'COMPLETE';
interface ReadInfo {
  deviceId: string;
  deviceName: string;
  message: string;
  pingNumber: number;
}

const NotifyReceiver = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [readInfo, setReadInfo] = useState<ReadInfo | null>(null);
  const [pingCount, setPingCount] = useState(0);

  const bleManager = useMemo(() => new BleManager(), []);
  const scheduleRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      bleManager.destroy();
      // Clear all timers on unmount
      scheduleRef.current.forEach(clearTimeout);
    };
  }, [bleManager]);


  const addLog = (message: string) => {
    console.log(message);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 200));
  };


  const requestPermissionsIfNeeded = async () => {
    if (Platform.OS !== 'android') {
      return true; // iOS permissions are handled differently (Info.plist)
    }
    
    // Check Android version
    const androidVersion = Platform.Version;

    if (androidVersion >= 31) {
      // Android 12+ (API 31+)
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Still needed for some cases
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const isScanGranted = granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED;
      const isConnectGranted = granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED;
      const isLocationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;

      if (!isScanGranted) {
        addLog('BLUETOOTH_SCAN permission denied');
      }
      if (!isConnectGranted) {
        addLog('BLUETOOTH_CONNECT permission denied');
      }
      if (!isLocationGranted) {
        addLog('ACCESS_FINE_LOCATION permission denied');
      }

      return isScanGranted && isConnectGranted && isLocationGranted;

    } else {
      // Android 11 (API 30) and below
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'BLE needs location access',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const scanForPing = async (pingNumber: number) => {
    setAppState('SCANNING');
    addLog(`Scanning for Ping #${pingNumber}...`);

    const okPerm = await requestPermissionsIfNeeded();
    if (!okPerm) {
      addLog('Permission denied');
      setAppState('ERROR');
      return;
    }

    const bleState = await bleManager.state();
    if (bleState !== BleState.PoweredOn) {
      addLog(`Bluetooth not enabled. State: ${bleState}`);
      setAppState('ERROR');
      return;
    }

    bleManager.startDeviceScan([SERVICE_UUID], null, async (error, device) => {
      if (error) {
        addLog(`Scan error: ${error.message}`);
        bleManager.stopDeviceScan();
        setAppState('ERROR');
        return;
      }
      if (!device) return;

      bleManager.stopDeviceScan();
      addLog(`Found device: ${device.name ?? 'Unknown'} (${device.id})`);
      let connectedDevice: Device | null = null;


      try {
        setAppState('CONNECTING');
        connectedDevice = await device.connect();
        addLog('Connected. Discovering services...');
        await connectedDevice.discoverAllServicesAndCharacteristics();

        setAppState('READING');
        const characteristic = await connectedDevice.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID);
        if (!characteristic?.value) throw new Error("Characteristic value is null.");
        const message = Buffer.from(characteristic.value, 'base64').toString('utf-8');

        addLog(`Ping #${pingNumber} received: "${message}"`);

        setReadInfo({
          deviceId: device.id,
          deviceName: device.name ?? 'NotifyBeacon',
          message: message,
          pingNumber
        });
        setPingCount(prev => prev + 1);
        setAppState('READ_SUCCESS');
      } catch (e: any) {
        addLog(`Error reading: ${e?.message ?? e}`);
        setAppState('ERROR');
      } finally {
        if (connectedDevice) {
          try { await connectedDevice.cancelConnection(); } catch (_) {}
          addLog('Disconnected.');
        }
      }
    });
  };

  const startScheduledPings = () => {
    setLogs([]);
    setPingCount(0);
    setReadInfo(null);
    setAppState('WAITING');
    addLog('Ping schedule started.');

    // Schedule all ping scan events
    const timers = [
      setTimeout(() => scanForPing(1), FIRST_PING_DELAY),
      setTimeout(() => scanForPing(2), SECOND_PING_DELAY),
      setTimeout(() => scanForPing(3), THIRD_PING_DELAY),
      setTimeout(() => {
        addLog('All pings complete.');
        setAppState('COMPLETE');
      }, THIRD_PING_DELAY + 2000)
    ];

    scheduleRef.current = timers;
  };


  const resetApp = () => {
    scheduleRef.current.forEach(clearTimeout);
    try { bleManager.stopDeviceScan(); } catch (_) {}
    setLogs([]);
    setReadInfo(null);
    setAppState('IDLE');
    setPingCount(0);
    addLog('Reset complete.');
  };


  const renderContent = () => {
    switch (appState) {
      case 'WAITING':
        return (<><Text style={styles.statusText}>Waiting for next ping window...</Text></>);
      case 'SCANNING':
      case 'CONNECTING':
      case 'READING':
        return (<><ActivityIndicator size="large" /><Text style={styles.statusText}>{appState}...</Text></>);
      case 'READ_SUCCESS':
        return readInfo && (
          <>
            <Text style={styles.titleSuccess}>Ping #{readInfo.pingNumber} Received</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}><Text style={styles.infoLabel}>Device:</Text> {readInfo.deviceName}</Text>
              <Text style={styles.infoText}><Text style={styles.infoLabel}>Message:</Text> "{readInfo.message}"</Text>
            </View>
          </>
        );
      case 'COMPLETE':
        return (
          <>
            <Text style={styles.titleSuccess}>All pings received</Text>
            <TouchableOpacity style={styles.button} onPress={resetApp}>
              <Text style={styles.buttonText}>Restart</Text>
            </TouchableOpacity>
          </>
        );
      case 'ERROR':
        return (
          <>
            <Text style={styles.titleError}>Failed</Text>
            <TouchableOpacity style={styles.button} onPress={resetApp}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return (
          <TouchableOpacity style={styles.button} onPress={startScheduledPings}>
            <Text style={styles.buttonText}>Start Ping Schedule</Text>
          </TouchableOpacity>
        );
    }
  };


  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLE Ping Receiver</Text>
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
  statusText: { fontSize: 18, color: '#475569', marginTop: 16, textAlign: 'center' },
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

export default NotifyReceiver;

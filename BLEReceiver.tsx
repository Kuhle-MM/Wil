import React, { useEffect, useState, useRef } from 'react';
import {
  PermissionsAndroid,
  Platform,
  Text,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { BleManager, ScanMode, Device, BleError } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

// Instantiate the manager once and export it, or handle it within the component.
const manager = new BleManager();

interface BLEAdvertisement {
  id: string;
  name: string | null;
  manufacturerData?: string | null;
  decodedPayload?: string;
}

export default function BLEReceiver() {
  // State for devices displayed in the UI
  const [devices, setDevices] = useState<BLEAdvertisement[]>([]);
  // Ref to collect discovered devices without triggering re-renders
  const discoveredDevicesRef = useRef<Map<string, BLEAdvertisement>>(new Map());

  // Function to handle permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      
      let permissions = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      if (apiLevel >= 31) { // Android 12+
        permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      const allGranted = permissions.every(p => granted[p] === PermissionsAndroid.RESULTS.GRANTED);

      if (!allGranted) {
        console.warn('One or more permissions were not granted.');
      }
      return allGranted;
    }
    return true;
  };
  
  useEffect(() => {
    // 1. An interval to update the UI from the ref every second
    const uiUpdateInterval = setInterval(() => {
      // Update state only if there are new devices to show
      if (discoveredDevicesRef.current.size !== devices.length) {
        setDevices(Array.from(discoveredDevicesRef.current.values()));
      }
    }, 1000); // Update the screen every second

    const startScan = async () => {
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) return;

      // Wait for the BLE manager to be powered on before scanning
      const subscription = manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
          manager.startDeviceScan(null, { scanMode: ScanMode.LowLatency },(error: BleError | null, device: Device | null) => { 
              if (error || !device) {
                  console.error(error);
                  return;
                }
              
              // 2. Update the ref instead of the state to avoid re-renders
              if (device && !discoveredDevicesRef.current.has(device.id)) {
                let decodedPayload: string | undefined;
                const manufacturerData = device.manufacturerData ?? undefined;

                if (manufacturerData) {
                  try {
                    const buffer = Buffer.from(manufacturerData, 'base64');
                    const raw = buffer.toString('utf-8');
                    // A more robust way to handle potential non-string data
                    decodedPayload = raw.replace(/[^\x20-\x7E]/g, ''); // Keep only printable ASCII
                  } catch (e) {
                    console.warn('Failed to decode manufacturerData:', e);
                  }
                }

                const newDevice: BLEAdvertisement = {
                  id: device.id,
                  name: device.name || 'Unnamed',
                  manufacturerData,
                  decodedPayload,
                };
                
                discoveredDevicesRef.current.set(device.id, newDevice);
              }
          });
          // Stop listening to state changes after we start scanning
          subscription.remove();
        }
      }, true); // The `true` argument emits the current state immediately
    };

    startScan();

    // 3. Robust cleanup function
    return () => {
      clearInterval(uiUpdateInterval); // Clear the interval
      manager.stopDeviceScan(); // Stop the scan
      console.log('Scan stopped and resources cleaned up.');
    };
  }, [devices.length]); // Re-check size comparison if devices length changes

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Nearby BLE Broadcasts:</Text>
        <Text style={styles.deviceCount}>Found: {devices.length}</Text>
        {devices.map((device) => (
          <View key={device.id} style={styles.deviceBox}>
            <Text style={styles.deviceName}>
              {device.name} ({device.id})
            </Text>
            <Text>Data: {device.decodedPayload || 'None'}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    padding: 20,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 5,
  },
  deviceCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  deviceBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  deviceName: {
    fontWeight: '600',
  },
});
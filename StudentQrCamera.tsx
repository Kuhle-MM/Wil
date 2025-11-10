// StudentQrCamera.tsx

import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from "react-native";
// --- 1. IMPORT NAVIGATION AND BLE ---
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { BleManager, Device, State } from 'react-native-ble-plx';
import { RootTabParamList } from './types'; 

// --- 2. CONFIGURE API AND BLE ---
const API_BASE_URL = "https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net";
const BLE_SCAN_TIMEOUT_MS = 15000; // 15 seconds to find the first ping

const bleManager = new BleManager();
type QrCameraRouteProp = RouteProp<RootTabParamList, 'QrCamera'>;

const StudentQrCamera: React.FC = () => {
  const scannerRef = useRef<QRCodeScanner>(null);
  const route = useRoute<QrCameraRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootTabParamList>>();
  
  // This now gets the studentNumber from the route params passed from the dashboard
  const { studentNumber } = route.params; 

  const [uiState, setUiState] = useState<'QR_SCAN' | 'BLE_SCAN'>('QR_SCAN');
  const [bleStatus, setBleStatus] = useState('Waiting to scan QR code...');
  
  const scannedLessonIDRef = useRef<string | null>(null);
  const bleScanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- 3. QR SCAN SUCCESS ---
  const onQrSuccess = async (e: any) => {
    const scannedLessonID = e?.data?.trim();
    if (!scannedLessonID) {
      Alert.alert("Invalid QR Code", "No data found.");
      return;
    }
    if (!studentNumber) {
      Alert.alert("Login Error", "Student Number is missing.");
      return;
    }

    console.log(`--- QR Scan OK: ${scannedLessonID} ---`);
    scannedLessonIDRef.current = scannedLessonID;
    
    setUiState('BLE_SCAN');
    setBleStatus('QR Scan Complete. Verifying presence for Ping 1/3...');
    
    await startBleScan();
  };
  
  // --- 4. CLEANUP ON SCREEN UNFOCUS ---
  useFocusEffect(
    React.useCallback(() => {
      // This runs when the screen comes into focus
      if (uiState === 'QR_SCAN') {
        scannerRef.current?.reactivate();
      }
      return () => {
        // This runs when the screen goes out of focus
        console.log("QR Camera unfocused, stopping BLE scan.");
        bleManager.stopDeviceScan();
        if (bleScanTimeoutRef.current) clearTimeout(bleScanTimeoutRef.current);
      };
    }, [uiState])
  );

  // --- 5. BLE LOGIC (FOR PING 1 ONLY) ---
  const startBleScan = async () => {
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) {
      return handleFailure("Bluetooth permission is required to verify presence.");
    }
    const bleState = await bleManager.state();
    if (bleState !== State.PoweredOn) {
      return handleFailure("Please turn on Bluetooth to verify presence.");
    }
    
    scanForDevice();
  };

  const scanForDevice = () => {
    const lessonID = scannedLessonIDRef.current;
    if (!lessonID) return handleFailure("Lesson ID was lost.");

    if (bleScanTimeoutRef.current) clearTimeout(bleScanTimeoutRef.current);
    bleScanTimeoutRef.current = setTimeout(() => {
        console.log("BLE Scan Timeout for Ping 1");
        handleFailure("Could not detect classroom beacon (Ping 1). Please move closer and try again.");
    }, BLE_SCAN_TIMEOUT_MS);

    setBleStatus(`Scanning for Ping 1/3...`);
    
    bleManager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
      if (error) {
        bleManager.stopDeviceScan();
        const errorMessage = error.message || "BLE scan error";
        return handleFailure(errorMessage);
      }
      
      // We are *only* looking for Ping 1
      if (device && device.name === `${lessonID}-1`) {
        console.log("Found Ping 1");
        handleDeviceFound();
      }
    });
  };

  const handleDeviceFound = () => {
    // Clear the timeout, we found it!
    if (bleScanTimeoutRef.current) clearTimeout(bleScanTimeoutRef.current);
    bleManager.stopDeviceScan(); 
    
    sendApiRequest();
  };

  const sendApiRequest = async () => {
    const lessonID = scannedLessonIDRef.current;
    setBleStatus('Ping 1 found. Clocking in...');
    
    try {
      const url = `${API_BASE_URL}/Lesson/clockin/${studentNumber}/${lessonID}`;
      const options = { method: 'POST', headers: { 'Content-Type': 'application/json' } };

      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes("Student already clocked in")) {
          console.log("Ping 1: Already clocked in. Treating as success.");
          // This is fine, proceed to success
        } else {
          // It was a *real* error
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
      }

      // --- PING 1 SUCCESS ---
      handlePing1Success();

    } catch (error) {
      console.error('API Ping 1 failed:', error);
      let errorMessage = "An unknown error occurred.";
      if (error instanceof Error) { errorMessage = error.message; }
      else { errorMessage = String(error); }
      handleFailure(`API Ping failed. ${errorMessage}`);
    }
  };

  // --- 6. SUCCESS AND FAILURE HANDLERS ---
  const handlePing1Success = () => {
    console.log("--- Ping 1 Success ---");
    bleManager.stopDeviceScan();
    if (bleScanTimeoutRef.current) clearTimeout(bleScanTimeoutRef.current);
    
    Alert.alert(
      "Clock-in Successful",
      "Ping 1/3 received. You are now clocked in. Pings 2 & 3 will be found automatically."
    );
    
    // --- THE HANDOFF ---
    // Navigate to Dashboard, passing the lessonID for silent scanning
    navigation.navigate('Main', {
      role: 'student', // Pass the role
      lessonID: scannedLessonIDRef.current as string, // Pass lessonID
      studentNumber: studentNumber, // Pass studentNumber
    });

    // Reset this screen
    resetScanner();
  };

  const handleFailure = (errorMessage: string) => {
    console.log(`--- BLE Failure: ${errorMessage} ---`);
    bleManager.stopDeviceScan();
    if (bleScanTimeoutRef.current) clearTimeout(bleScanTimeoutRef.current);

    Alert.alert(
      "Presence Not Verified",
      `We couldn't confirm your location. Please try scanning again.\n\n(Error: ${errorMessage})`
    );
    
    resetScanner();
  };
  
  const resetScanner = () => {
    setUiState('QR_SCAN');
    setBleStatus('Ready to scan QR code.');
    scannedLessonIDRef.current = null;
    scannerRef.current?.reactivate();
  };

  // --- 7. PERMISSIONS HELPER (Unchanged) ---
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

  // --- 8. RENDER LOGIC (Unchanged) ---
  return (
    <View style={styles.container}>
      {uiState === 'BLE_SCAN' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>{bleStatus}</Text>
          <Text style={styles.subText}>Please wait, this may take a moment...</Text>
        </View>
      ) : (
        <QRCodeScanner
          ref={scannerRef}
          onRead={onQrSuccess} 
          reactivate={false} 
          flashMode={RNCamera.Constants.FlashMode.auto}
          topContent={
            <Text style={styles.instructionText}>
              Align the QR code within the frame
            </Text>
          }
          bottomContent={
            <TouchableOpacity
              style={styles.button}
              onPress={() => scannerRef.current?.reactivate()}
            >
              <Text style={styles.buttonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
};

// --- 9. STYLES (CLEANED) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    padding: 16,
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  subText: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default StudentQrCamera;
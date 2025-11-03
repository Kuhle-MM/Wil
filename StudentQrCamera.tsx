import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, PermissionsAndroid, Platform, Vibration } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extend the type definition to include ref
declare module 'react-native-qrcode-scanner' {
  interface RNQRCodeScannerProps {
    ref?: any;
  }
}

const StudentQrCamera: React.FC = () => {
  const scannerRef = useRef<QRCodeScanner>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentNumber, setStudentNumber] = useState<string | null>(null);

  // Load student number from AsyncStorage
  useEffect(() => {
    const loadStudentNumber = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (session) {
          const { studentNumber } = JSON.parse(session);
          setStudentNumber(studentNumber);
        } else {
          Alert.alert('Error', 'No active session found. Please log in again.');
        }
      } catch (err) {
        console.error('Error loading student session:', err);
        Alert.alert('Error', 'Failed to load student information.');
      }
    };
    loadStudentNumber();
  }, []);

  // Ask only for CAMERA permission — no VIBRATE needed
  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app requires camera access to scan QR codes.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes.');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestCameraPermission();
  }, []);

  const onSuccess = async (e: any) => {
    if (scanned) return; // prevent multiple scans

    setScanned(true);
    setLoading(true);
    Vibration.vibrate(100); // Vibrate on scan

    try {
      const lessonId = e.data?.trim();

      if (!lessonId) {
        Alert.alert(
          'Invalid QR Code',
          'The scanned QR code is not recognized as a valid lesson.\nPlease scan a valid QR code.'
        );
        return;
      }

      if (!studentNumber) {
        Alert.alert('Error', 'Student number not found. Please log in again.');
        return;
      }

      console.log('Scanned QR Code:', lessonId);
      console.log('Using Student Number:', studentNumber);

      // Calling clock-in endpoint dynamically
      const response = await fetch(
        `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/clockin/${studentNumber}/${lessonId}`,
        { method: 'POST' }
      );

      if (response.ok) {
        Alert.alert('Success!', `Clock-in successful for lesson ID: ${lessonId}`);
      } else if (response.status === 404) {
        Alert.alert('Lesson Not Found', `No lesson found with ID: ${lessonId}. Please check the QR code.`);
      } else if (response.status === 409) {
        Alert.alert('Already Clocked In', `You have already clocked in for lesson ID: ${lessonId}.`);
      } else {
        Alert.alert('Clock-in Failed', 'Server could not process the request. Please try again.');
      }
    } catch (error: any) {
      console.error('QR Scan Error:', error);
      Alert.alert(
        'Scan Error',
        `An error occurred while processing the QR code: ${error.message || 'Unknown error'}`
      );
    } finally {
      setLoading(false);
      setTimeout(() => setScanned(false), 2000);
      scannerRef.current?.reactivate();
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : (
        <QRCodeScanner
          onRead={onSuccess}
          reactivate={false}
          fadeIn={true}
          showMarker={true}
          flashMode={RNCamera.Constants.FlashMode.auto}
          topContent={<Text style={styles.instructionText}>Align the QR code within the frame</Text>}
          bottomContent={
            <TouchableOpacity style={styles.button} onPress={() => scannerRef.current?.reactivate()}>
              <Text style={styles.buttonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          }
          ref={scannerRef}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 12,
  },
});

export default StudentQrCamera;

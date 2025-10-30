import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

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

  const onSuccess = async (e: any) => {
    if (scanned) return; // prevent multiple scans

    setScanned(true);
    setLoading(true);

    try {
      const lessonId = e.data;
      console.log('Scanned QR Code:', lessonId);

      // Example: Call your backend clock-in endpoint
      const response = await fetch(`https://your-api-endpoint.com/api/clockin/${lessonId}`, {
        method: 'POST',
      });

      if (response.ok) {
        Alert.alert('✅ Success', 'Clock-in successful!');
      } else {
        Alert.alert('⚠️ Error', 'Failed to clock in. Please try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      // Reactivate scanner for another scan
      setTimeout(() => setScanned(false), 2000);
      scannerRef.current?.reactivate();
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : (
        <QRCodeScanner
          onRead={onSuccess}
          reactivate={false}
          fadeIn={true}
          showMarker={true}
          flashMode={RNCamera.Constants.FlashMode.auto}
          topContent={<Text style={styles.instructionText}>📷 Align the QR code within the frame</Text>}
          bottomContent={
            <TouchableOpacity style={styles.button} onPress={() => scannerRef.current?.reactivate()}>
              <Text style={styles.buttonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          }
          // @ts-ignore: ref is supported at runtime
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

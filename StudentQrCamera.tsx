import React from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

const StudentQrCamera = () => {
  const onSuccess = (e: any) => {
    console.log('QR Code Data:', e.data);
    // You can handle navigation or data processing here
    Linking.openURL(e.data).catch(err => console.error('Invalid QR', err));
  };

  return (
    <View style={styles.container}>
      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.off}
        topContent={<Text style={styles.centerText}>Scan a QR Code</Text>}
        bottomContent={<Text style={styles.bottomText}>Point your camera at a QR code</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#333',
    textAlign: 'center',
  },
  bottomText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
});

export default StudentQrCamera;

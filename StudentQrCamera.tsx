import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";

const API_BASE_URL =
  "https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api";

const StudentQrCamera: React.FC = () => {
  const scannerRef = useRef<QRCodeScanner>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSuccess = async (e: any) => {
    const qrText = e.data?.trim();
    console.log("Scanned QR:", qrText);

    if (!qrText) {
      Alert.alert("Invalid QR Code", "No data found in QR code.");
      return;
    }

    try {
      setLoading(true);
      const url = `${API_BASE_URL}/scanQRCode`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          QRText: qrText, // must match backend request
          StudentID: studentNumber, // backend expects this field
        }),
      });

      const text = await response.text();
      console.log("API response:", text);

      if (!response.ok) {
        throw new Error(text || "Clock-in failed");
      }

      Alert.alert("Clock-in Successful", "You have been clocked in successfully!");
    } catch (error: any) {
      console.error("Clock-in error:", error);
      Alert.alert("Error", error.message || "Could not clock in. Please try again.");
    } finally {
      setLoading(false);
    }
  } catch (error: any) {
    console.error('QR Scan Error:', error);
    Alert.alert(
      'Scan Error',
      `An error occurred while processing the QR code: ${error.message || 'Unknown error'}`
    );
  } finally {
    setLoading(false);
    // Reactivate scanner after delay
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
          reactivate={true} // allow reuse
          reactivateTimeout={2000}
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

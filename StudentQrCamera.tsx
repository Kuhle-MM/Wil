import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";

const API_BASE_URL =
  "https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api";

const StudentQrCamera: React.FC<{ studentNumber: string }> = ({ studentNumber }) => {
  const scannerRef = useRef<QRCodeScanner>(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const onSuccess = async (e: any) => {
    if (scanned) return; // Prevent duplicate scans
    setScanned(true);

    const qrText = e?.data?.trim();
    console.log("Scanned QR:", qrText);

    if (!qrText) {
      Alert.alert("Invalid QR Code", "No data found in QR code.");
      setScanned(false);
      return;
    }

    try {
      setLoading(true);
      const url = `${API_BASE_URL}/scanQRCode`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          QRText: qrText,
          StudentID: studentNumber, // match backend expectation
        }),
      });

      const text = await response.text();
      console.log("API response:", text);

      if (!response.ok) throw new Error(text || "Clock-in failed");

      Alert.alert("Clock-in Successful", "You have been clocked in successfully!");
    } catch (error: any) {
      console.error("Clock-in error:", error);
      Alert.alert(
        "Error",
        error.message || "Could not clock in. Please try again."
      );
    } finally {
      setLoading(false);
      // Reactivate scanner after short delay
      setTimeout(() => {
        setScanned(false);
        scannerRef.current?.reactivate();
      }, 2000);
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
          ref={scannerRef}
          onRead={onSuccess}
          reactivate={false} // we manually control reactivation
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
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 12,
  },
});

export default StudentQrCamera;

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
  "https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net";

// <-- 2. ADDED PROPS
interface Props {
  studentNumber: string;
}

const StudentQrCamera: React.FC<Props> = ({ studentNumber }) => { // <-- 2. USING PROPS
  const scannerRef = useRef<QRCodeScanner>(null);
  // This state isn't needed if you use reactivateTimeout
  // const [scanned, setScanned] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  // <-- 3. FIXED THE TRY/CATCH STRUCTURE
  const onSuccess = async (e: any) => {
    try {
      setLoading(true);
      const qrText = e.data?.trim();
      console.log("Scanned QR:", qrText);

      if (!qrText) {
        Alert.alert("Invalid QR Code", "No data found in QR code.");
        return; // Exit early
      }

      const url = `${API_BASE_URL}/scanQRCode`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          QRText: qrText,
          StudentID: studentNumber, // <-- 2. This variable now exists
        }),
      });

      const text = await response.text();
      console.log("API response:", text);

      if (!response.ok) {
        // Try to parse a meaningful error from the response
        let errorMessage = text;
        try {
          errorMessage = JSON.parse(text)?.message || text;
        } catch {
          // Not JSON, just use the raw text
        }
        throw new Error(errorMessage);
      }

      Alert.alert("Clock-in Successful", "You have been clocked in successfully!");

    } catch (error: any) {
      console.error("Clock-in error:", error);
      Alert.alert(
        "Error",
        error.message || "Could not clock in. Please try again."
      );
    } finally {
      setLoading(false);
      // You don't need manual reactivation here
      // The `reactivateTimeout` prop on the scanner handles this
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
          reactivate={true} // Use the built-in reactivation
          reactivateTimeout={2500} // Wait 2.5 seconds before scanning again
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
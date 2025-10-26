import React, { useState, useRef } from "react";
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
  "https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson";

const StudentQrCamera = ({ studentNumber }: { studentNumber: string }) => {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [message, setMessage] = useState("Searching for QR code...");
  const scannerRef = useRef<QRCodeScanner>(null);

  const resetScanner = () => {
    setScanning(true);
    setMessage("Searching for QR code...");
    scannerRef.current?.reactivate();
  };

  const onSuccess = async (e: any) => {
    const lessonId = e?.data?.trim();
    setScanning(false);

    if (!lessonId) {
      Alert.alert("Invalid QR Code", "No lesson ID found in QR code.");
      setMessage("No QR code detected. Try again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Processing clock-in...");

      const url = `${API_BASE_URL}/clockin/${studentNumber}`;
      console.log("Calling API:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(errorText || "Clock-in failed");
      }

      const data = await response.json();
      console.log("Clock-in success:", data);

      Alert.alert("✅ Clock-in Successful", `You have been clocked in for lesson ${lessonId}`);
      setMessage(`Clock-in successful for lesson ${lessonId}`);
    } catch (error: any) {
      console.error("Clock-in error:", error);
      Alert.alert("❌ Error", error.message || "Could not clock in. Please try again.");
      setMessage("Clock-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Clocking you in...</Text>
        </View>
      ) : (
        <>
          <QRCodeScanner
            ref={scannerRef}
            onRead={onSuccess}
            reactivate={false}
            fadeIn={true}
            flashMode={RNCamera.Constants.FlashMode.auto}
            topContent={<Text style={styles.centerText}>{message}</Text>}
            bottomContent={
              <View style={styles.bottomContainer}>
                <Text style={styles.bottomText}>Align the QR code within the frame</Text>
                {!scanning && (
                  <TouchableOpacity style={styles.buttonRescan} onPress={resetScanner}>
                    <Text style={styles.buttonText}>🔄 Re-Scan</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />

          {scanning && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={styles.overlayText}>Looking for QR code...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centerText: {
    fontSize: 18,
    padding: 24,
    color: "#333",
    textAlign: "center",
  },
  bottomContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  bottomText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  overlay: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  overlayText: {
    color: "#0066cc",
    fontSize: 16,
    marginTop: 10,
  },
  buttonRescan: {
    backgroundColor: "#0066cc",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default StudentQrCamera;

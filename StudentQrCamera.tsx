import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

// Replace this with your actual API endpoint base
const API_BASE_URL = "https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson";

const StudentQrCamera = ({ studentNumber }: { studentNumber: string }) => {
  const [loading, setLoading] = useState(false);

  const onSuccess = async (e: any) => {
    const lessonId = e.data.trim(); // QR code contains lessonId
    console.log("Scanned Lesson ID:", lessonId);

    if (!lessonId) {
      Alert.alert("Invalid QR Code", "No lesson ID found in QR code.");
      return;
    }

    try {
      setLoading(true);

      const url = `${API_BASE_URL}/clockin/${studentNumber}`;
      console.log("Calling API:", url);

      // Example body (adjust if your backend expects JSON or query parameters)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId }), // send lessonId in body
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(errorText || "Clock-in failed");
      }

      const data = await response.json();
      console.log("Clock-in success:", data);

      Alert.alert("Clock-in Successful", `You have been clocked in for lesson ${lessonId}`);
    } catch (error: any) {
      console.error("Clock-in error:", error);
      Alert.alert("Error", error.message || "Could not clock in. Please try again.");
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
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.auto}
          topContent={<Text style={styles.centerText}>Scan the QR code for your lesson</Text>}
          bottomContent={<Text style={styles.bottomText}>Make sure the code fits in the box</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: "#333",
    textAlign: "center",
  },
  bottomText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
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
});

export default StudentQrCamera;

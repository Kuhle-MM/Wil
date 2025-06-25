import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';


const LecturerAttendance: React.FC = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);

  useEffect(() => {
    const loadClockStatus = async () => {
      const savedStatus = await AsyncStorage.getItem('clockedIn');
      setIsClockedIn(savedStatus === 'true');
    };
    loadClockStatus();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('clockedIn', isClockedIn.toString());
  }, [isClockedIn]);

  const handleClockIn = async () => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (!session) {
        Alert.alert('Error', 'No active session found. Please log in again.');
        return;
      }

      const { lecturerID } = JSON.parse(session);
      const endpoint = `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api/StudentClocking/lecturer/clockin/${lecturerID}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecturerID }),
      });

      const text = await response.text();

      if (!response.ok) {
        Alert.alert('Failed to clock in', text || 'Something went wrong.');
      } else {
        setIsClockedIn(true);
        Alert.alert('Clock-in Successful', text || 'You have clocked in.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  const handleClockOut = async () => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (!session) {
        Alert.alert('Error', 'No active session found. Please log in again.');
        return;
      }

      const { lecturerID } = JSON.parse(session);
      const endpoint = `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api/StudentClocking/lecturer/clockout/${lecturerID}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecturerID }),
      });

      const text = await response.text();

      if (!response.ok) {
        Alert.alert('Failed to clock out', text || 'Something went wrong.');
      } else {
        setIsClockedIn(false);
        Alert.alert('Clock-out Successful', text || 'You have clocked out.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  
  return (
    <View style={styles.centeredContainer}>
        <Text style={styles.header}>Lecturer Clock In</Text>
        <TouchableOpacity style={styles.smallButton} onPress={isClockedIn ? handleClockOut : handleClockIn}><Text>{isClockedIn ? 'Clock Out' : 'Clock In'}</Text></TouchableOpacity>
    </View>
  );
};

export default LecturerAttendance;


const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 18,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    marginVertical: 8,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ccc',
    padding: 12,
    width: 200,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  roleButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  roleSelected: {
    backgroundColor: '#cce5ff',
    borderColor: '#007bff',
  },
});
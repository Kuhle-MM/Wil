import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import LecturerBottomNav from './BottomNav.tsx';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const LecturerAttendance: React.FC = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const navigation = useNavigation<AuthNavProp>();
    const route = useRoute<AuthRouteProp>();
    const { role } = route.params ?? { role: "lecturer" };

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

      const { studentNumber } = JSON.parse(session);
      const endpoint = `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api/StudentClocking/lecturer/clockin/${studentNumber}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNumber }),
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

      const { studentNumber } = JSON.parse(session);
      const endpoint = `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api/StudentClocking/lecturer/clockout/${studentNumber}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNumber }),
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
    <ImageBackground
      source={require('./assets/images/login.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.header}>Lecturer Attendance</Text>

        <View style={styles.statusContainer}>
          <Icon
            name={isClockedIn ? 'checkmark-circle' : 'close-circle'}
            size={70}
            color={isClockedIn ? '#4CAF50' : '#E53935'}
          />
          <Text style={styles.statusText}>
            {isClockedIn ? 'You are Clocked In' : 'You are Clocked Out'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isClockedIn ? styles.clockOutButton : styles.clockInButton]}
          onPress={isClockedIn ? handleClockOut : handleClockIn}
        >
          <Icon
            name={isClockedIn ? 'log-out-outline' : 'log-in-outline'}
            size={26}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </Text>
        </TouchableOpacity>
        <LecturerBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
      </View>
    </ImageBackground>
  );
};

export default LecturerAttendance;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#064f62',
    marginBottom: 40,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    fontSize: 20,
    color: '#fff',
    marginTop: 12,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  clockInButton: {
    backgroundColor: '#4CAF50',
  },
  clockOutButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

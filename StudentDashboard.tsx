import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, CommonActions, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';


type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const StudentDashboard: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
    const route = useRoute<AuthRouteProp>();
    const { role } = route.params;
    const handleReport = async () => {
    navigation.navigate('Report');  
    };
    const handleCalandar = async () => {
    navigation.navigate('Calendar');  
    };
    const handleAttendance = async () => {
    navigation.navigate('StudentAttendance');  
    };
    const handleModule = async () => {
    navigation.navigate('StudentModules', { role });  
    };
    const handlePing = async () => {
    navigation.navigate('BLEReceiver', { role });  
    };
  return (
    <View style={styles.scrollContainer}>
        <Text style={styles.header}>Dashboard</Text>
        <Text style={styles.sectionTitle}>Today’s modules</Text>
        <View style={styles.card}><Text>today’s modules</Text></View>
        <Text style={styles.sectionTitle}>Weekly attendance progress</Text>
        <View style={styles.card}><Text>weekly attendance progress</Text></View>
        <TouchableOpacity style={styles.smallButton} onPress={handleReport}><Text>report overview</Text></TouchableOpacity>
        <TouchableOpacity style={styles.smallButton}  onPress={handleCalandar}><Text>get calendar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={handleAttendance}><Text>Clock In</Text></TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={handleModule}><Text>Your Modules</Text></TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={handlePing}><Text>Ping View</Text></TouchableOpacity>
        {/* <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity> */}
      </View>
  );
};

export default StudentDashboard;

/* const navigation = useNavigation();

const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('userSession');

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Auth',
            params: { role: 'student' }, 
          },
        ],
      })
    );
  } catch (e) {
    console.error('Logout failed', e);
  }
}; */

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
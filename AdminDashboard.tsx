import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import { SvgUri } from 'react-native-svg';


type AuthRouteProp = RouteProp<RootTabParamList, 'AuthAdmin'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;
  const createUser = async () => {
  navigation.navigate('CreateUser', { role });  
  };
  const createModule = async () => {
  navigation.navigate('CreateModule', { role });  
  };
  const viewModules = async () => {
  navigation.navigate('Modules', { role });  
  };
    
  return (
  <View style={styles.scrollContainer}>
    <Text style={styles.header}>Dashboard</Text>

    <TouchableOpacity style={styles.smallButton} onPress={createUser}>
      <Text>Create User</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.smallButton} onPress={viewModules}>
      <Text>Modules</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.smallButton} onPress={createModule}>
      <Text>Create Module</Text>
    </TouchableOpacity>

    <Text style={styles.header}>QR Code</Text>

    <SvgUri
      width="200"
      height="200"
      uri="https://varsitytracker2025.blob.core.windows.net/qrcodes/jdjones.svg"
    />
  </View>
);
};
export default AdminDashboard;

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
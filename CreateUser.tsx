import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import { Picker } from '@react-native-picker/picker';

type AuthRouteProp = RouteProp<RootTabParamList, 'CreateUser'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const CreateUser: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleCreateUser = async () => {
    if (!email || !password || !selectedRole || !firstName || !lastName) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if ((selectedRole === "Lecturer" || selectedRole === "Admin") && !email.toLowerCase().endsWith('@varsitycollege.co.za')) {
      Alert.alert('Invalid Email, must contain @varsitycollege.co.za');
      return;
    }

    if (selectedRole === "Student" && (!email.toLowerCase().startsWith("st") || !email.toLowerCase().endsWith('@vcconnect.edu.za'))) {
      Alert.alert('Invalid Email, must contain st...@vcconnect.edu.za');
      return;
    }
    
    const endpoint = 'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Access/create';

      try {
      const payload = {
        email,
        password,
        role: selectedRole,
        firstName,
        lastName
      };
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      const resultText = await response.text();
  
      if (!response.ok) {
        Alert.alert('Failed', resultText);
        return;
      }
  
      Alert.alert('Success', resultText);
      navigation.navigate('MainAdmin', { role });
  
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create User</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Picker
        selectedValue={selectedRole}
        onValueChange={(itemValue) => setSelectedRole(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a role" value="" />
        <Picker.Item label="Student" value="Student" />
        <Picker.Item label="Lecturer" value="Lecturer" />
        <Picker.Item label="Admin" value="Admin" />
      </Picker>
      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateUser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  picker: { 
    height: 50, 
    width: '100%' 
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  button: {
    backgroundColor: '#4287f5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
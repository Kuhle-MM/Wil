import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import { Picker } from '@react-native-picker/picker';

type AuthRouteProp = RouteProp<RootTabParamList, 'CreateModule'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const CreateModule: React.FC = () => {
    const navigation = useNavigation<AuthNavProp>();
    const route = useRoute<AuthRouteProp>();
    const { role } = route.params;

    const [code, setCode] = useState('');
    const [moduleName, setModuleName] = useState('');
    const [NQF, setNQF] = useState('');
    const [credits, setCredits] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [year, setYear] = useState('');

  const handleCreateModule = async () => {

    if (!moduleName || !code || !courseCode || !year || !NQF || !credits) {
      Alert.alert('Missing Fields', 'Please enter all required fields.');
      return; 
    }
    // Validate Module Code: 4 letters + 4 digits
    const codeRegex = /^[A-Z]{4}[0-9]{4}$/;
    if (!codeRegex.test(code)) {
      Alert.alert('Invalid Module Code', 'Module code must be 4 letters followed by 4 numbers.');
      return;
    }
    
    const endpoint = 'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/create_module';

    try {
    const payload = {
      code,
      moduleName,
      NQF: parseInt(NQF),
      credits: parseInt(credits),
      courseCode : courseCode,
      year: parseInt(year)
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
      <Text style={styles.title}>Create Module</Text>

      <TextInput placeholder="Module Name" value={moduleName} onChangeText={setModuleName} style={styles.input} />
      <TextInput placeholder="Module Code" value={code} onChangeText={(text) => setCode(text.toUpperCase())}  style={styles.input} autoCapitalize="characters"/>
      
      <Picker
        selectedValue={courseCode}
        onValueChange={(itemValue) => setCourseCode(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Course Code" value="" />
        <Picker.Item label="BCAD0701" value="BCAD0701" />
      </Picker>
      <TextInput placeholder="Year" value={year} onChangeText={setYear} style={styles.input} />
      <TextInput placeholder="NQF" value={NQF} onChangeText={setNQF} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Credits" value={credits} onChangeText={setCredits} style={styles.input} />
      
      <TouchableOpacity style={styles.button} onPress={handleCreateModule}>
        <Text style={styles.buttonText}>Create Module</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateModule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff'
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
  picker: { 
    height: 50, 
    width: '100%' 
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
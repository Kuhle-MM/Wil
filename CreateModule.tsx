import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import { Picker } from '@react-native-picker/picker';
import AdminBottomNav from './BottomNav.tsx';

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

    const codeRegex = /^[A-Z]{4}[0-9]{4}$/;
    if (!codeRegex.test(code)) {
      Alert.alert('Invalid Module Code', 'Module code must be 4 letters followed by 4 numbers.');
      return;
    }

    const endpoint =
      'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/create_module';

    try {
      const payload = {
        code,
        moduleName,
        NQF: parseInt(NQF),
        credits: parseInt(credits),
        courseCode,
        year: parseInt(year),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    <ImageBackground
      source={require('./assets/images/login.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>📘 Create Module</Text>
          <Text style={styles.headerSubtitle}>Enter the module details below</Text>
        </View>

        <View style={styles.formCard}>
          <TextInput
            placeholder="Module Name"
            value={moduleName}
            onChangeText={setModuleName}
            style={styles.input}
            placeholderTextColor="#6e6e6e"
          />

          <TextInput
            placeholder="Module Code (e.g. PROG1234)"
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            style={styles.input}
            placeholderTextColor="#6e6e6e"
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={courseCode}
              onValueChange={(itemValue) => setCourseCode(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Course Code" value="" />
              <Picker.Item label="BCAD0701" value="BCAD0701" />
            </Picker>
          </View>

          <TextInput
            placeholder="Year (e.g. 2025)"
            value={year}
            onChangeText={setYear}
            style={styles.input}
            placeholderTextColor="#6e6e6e"
            keyboardType="numeric"
          />

          <TextInput
            placeholder="NQF Level"
            value={NQF}
            onChangeText={setNQF}
            style={styles.input}
            placeholderTextColor="#6e6e6e"
            keyboardType="numeric"
          />

          <TextInput
            placeholder="Credits"
            value={credits}
            onChangeText={setCredits}
            style={styles.input}
            placeholderTextColor="#6e6e6e"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.button} onPress={handleCreateModule}>
            <Text style={styles.buttonText}>Create Module</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AdminBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </ImageBackground>
  );
};

export default CreateModule;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#064f62',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#d8f3dc',
  },
  formCard: {
    backgroundColor: '#A4C984',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#064f62',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

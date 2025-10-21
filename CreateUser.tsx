import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AdminBottomNav from './BottomNav.tsx';

type AuthRouteProp = RouteProp<RootTabParamList, 'CreateUser'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const CreateUser: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleCreateUser = async () => {
    if (!email || !password || !selectedRole || !firstName || !lastName) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (
      (selectedRole === 'Lecturer' || selectedRole === 'Admin') &&
      !email.toLowerCase().endsWith('@varsitycollege.co.za')
    ) {
      Alert.alert('Invalid Email', 'Lecturers/Admins must use @varsitycollege.co.za');
      return;
    }

    if (
      selectedRole === 'Student' &&
      (!email.toLowerCase().startsWith('st') ||
        !email.toLowerCase().endsWith('@vcconnect.edu.za'))
    ) {
      Alert.alert('Invalid Email', 'Students must use st...@vcconnect.edu.za');
      return;
    }

    const endpoint =
      'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Access/create';

    try {
      const payload = { email, password, role: selectedRole, firstName, lastName };

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
        style={styles.backgroundImage}
        resizeMode="cover"
      >
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>👤 Create New User</Text>
        <Text style={styles.headerSubtitle}>Fill in the details below</Text>
      </View>

      <View style={styles.formCard}>
        {/* Inputs */}
        <Text style={styles.label}>Email:</Text>
        <TextInput
          placeholder="Enter user email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Password:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#064f62"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Role:</Text>
        <View style={styles.pickerContainer}>
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
        </View>

        <Text style={styles.label}>First Name:</Text>
        <TextInput
          placeholder="Enter first name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />

        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          placeholder="Enter last name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

    <AdminBottomNav
      navigation={navigation}
      role={role as 'student' | 'lecturer' | 'admin'}
    />
      </View>
    </ImageBackground>
);
};

export default CreateUser;

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%', backgroundColor: '#FFFFFF' },
  scrollContainer: {
  flexGrow: 1,
  backgroundColor: 'transparent',
  padding: 16,
  alignItems: 'center',
  },
  headerCard: {
    backgroundColor: '#064f62',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    width: '100%',
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
  label: {
    fontSize: 20,
    color: '#064f62',
    fontWeight: 'bold',
    marginBottom: 6,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
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

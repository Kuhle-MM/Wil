import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const role = route.params?.role ?? 'student';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

//   const handleLogin = async () => {
//   const endpoint = 'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Access/login_student';

//   try {
//     const response = await fetch(endpoint, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });

//     let json;
//     try {
//       json = await response.json();
//     } catch {
//       Alert.alert('Error', 'Invalid response from server.');
//       return;
//     }

//     if (!response.ok || !json.success) {
//       Alert.alert('Login Failed', json.message || 'Invalid credentials');
//       return;
//     }

//     const idNumber = email.split('@')[0];

//     await AsyncStorage.setItem('userSession', JSON.stringify({
//       studentNumber: idNumber,
//       role,
//       token: json.token || null, 
//       email,
//     }));

//     Alert.alert('Success', json.message);
//     navigation.navigate('Main', { role });
//   } catch (error) {
//     console.error(error);
//     Alert.alert('Error', 'Could not connect to the server.');
//   }

// };
// const handleAdminLogin = async () => {
//   const endpoint = 'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Access/login_admin'; 

//   try {
//     const response = await fetch(endpoint, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });

//     const contentType = response.headers.get('content-type') || '';
//     let json: { success?: boolean; message?: string; token?: string; role?: string } = {};

//     if (contentType.includes('application/json')) {
//       json = await response.json();
//     } else {
//       const text = await response.text();
//       console.warn('Server returned non-JSON:', text);
//       Alert.alert('Error', text);
//       return;
//     }

//     if (!response.ok || !json.success) {
//       Alert.alert('Login Failed', json.message || 'Invalid credentials');
//       return;
//     }

//     const idNumber = email.split('@')[0];
//     const userRole = json.role as 'student' | 'lecturer' | 'admin' ?? 'admin';

//     await AsyncStorage.setItem('userSession', JSON.stringify({
//       studentNumber: idNumber,
//       role: userRole,
//       token: json.token || null,
//       email,
//     }));

//     Alert.alert('Success', json.message);
//     navigation.navigate(userRole === 'admin' ? 'MainAdmin' : 'Main', { role: userRole });

//   } catch (error) {
//     console.error('Network or server error:', error);
//     Alert.alert('Error', 'Could not connect to the server.');
//   }
// };

// const handleStudentLogin = async () => {
//   const endpoint = 'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Access/login_student'; 

//   try {
//     const response = await fetch(endpoint, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });

//     const contentType = response.headers.get('content-type') || '';
//     let json: { success?: boolean; message?: string; token?: string; role?: string } = {};

//     if (contentType.includes('application/json')) {
//       json = await response.json();
//     } else {
//       const text = await response.text();
//       console.warn('Server returned non-JSON:', text);
//       Alert.alert('Error', text);
//       return;
//     }

//     if (!response.ok || !json.success) {
//       Alert.alert('Login Failed', json.message || 'Invalid credentials');
//       return;
//     }

//     const idNumber = email.split('@')[0];
//     const userRole = json.role as 'student' | 'lecturer' | 'admin' ?? 'student';

//     await AsyncStorage.setItem('userSession', JSON.stringify({
//       studentNumber: idNumber,
//       role: userRole,
//       token: json.token || null,
//       email,
//     }));

//     Alert.alert('Success', json.message);
//     navigation.navigate(userRole === 'student' ? 'Main' : 'Main', { role: userRole });

//   } catch (error) {
//     console.error('Network or server error:', error);
//     Alert.alert('Error', 'Could not connect to the server.');
//   }
// };

// const handleLecturerLogin = async () => {
//   const endpoint = 'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Access/login_lecturer'; 

//   try {
//     const response = await fetch(endpoint, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });

//     const contentType = response.headers.get('content-type') || '';
//     let json: { success?: boolean; message?: string; token?: string; role?: string } = {};

//     if (contentType.includes('application/json')) {
//       json = await response.json();
//     } else {
//       const text = await response.text();
//       console.warn('Server returned non-JSON:', text);
//       Alert.alert('Error', text);
//       return;
//     }

//     if (!response.ok || !json.success) {
//       Alert.alert('Login Failed', json.message || 'Invalid credentials');
//       return;
//     }

//     const idNumber = email.split('@')[0];
//     const userRole = json.role as 'student' | 'lecturer' | 'admin' ?? 'lecturer';

//     await AsyncStorage.setItem('userSession', JSON.stringify({
//       studentNumber: idNumber,
//       role: userRole,
//       token: json.token || null,
//       email,
//     }));

//     Alert.alert('Success', json.message);
//     navigation.navigate(userRole === 'lecturer' ? 'MainLecturer' : 'Main', { role: userRole });

//   } catch (error) {
//     console.error('Network or server error:', error);
//     Alert.alert('Error', 'Could not connect to the server.');
//   }
// };

const handleLoginUser = async () => {
  const endpoint = 'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Access/login'; 

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();
    console.log('Response:', text); 
    const json = JSON.parse(text);

    if (!response.ok || !json.success) {
      Alert.alert('Login Failed', json.message || 'Invalid credentials');
      return;
    }

    const idNumber = email.split('@')[0];
    const userRole = json.role as 'student' | 'lecturer' | 'admin';
    const userName = json.name || idNumber;
    await AsyncStorage.setItem('userSession', JSON.stringify({
      studentNumber: idNumber,
      role: userRole, 
      token: json.token || null,
      email,
      name: userName
    }));

    Alert.alert('Success', json.message);

    if (userRole.toLowerCase() === 'student') {
      navigation.navigate('Main', { role: userRole });
    } else if (userRole.toLowerCase() === 'lecturer') {
      navigation.navigate('MainLecturer', { role: userRole });
    } else if (userRole.toLowerCase() === 'admin') {
      navigation.navigate('MainAdmin', { role: userRole });
    }

  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Could not connect to the server.');
  }
};


  return (
    <ImageBackground
          source={require('./assets/images/BackgroundImage.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover" 
        >
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLoginUser}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
    </ImageBackground>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  input: {
    fontSize: 20,
    borderWidth: 2,
    backgroundColor: '#fff',
    borderColor: 'black',
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
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold'
  }
});
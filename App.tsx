// App.tsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


const StackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import AuthScreen from './AuthScreen';
import AuthScreenLec from './AuthScreenLect.tsx';
import LecturersDashboard from './LecturerDashboard.tsx';
import StudentsDashboard from './StudentDashboard';
import StudentsCalandar from './StudentsCalendar';
import StudentsReports from './StudentsReports'
import AuthScreenLect from './AuthScreenLect.tsx';

const Stack = createNativeStackNavigator<RootTabParamList>();

type LoginScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Login'>;
type MainScreenRouteProp = RouteProp<RootTabParamList, 'Main'>;
// Login Screen with role selection
const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootTabParamList>>();

  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.logo}>tapify</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Auth', { role: 'student' })}>
        <Text style={styles.buttonText}>Login as Student</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AuthLecturer', { role: 'lecturer' })}>
        <Text style={styles.buttonText}>Login as Lecturer</Text>
      </TouchableOpacity>
    </View>
  );
};

/* // Placeholder student screens
const StudentDashboard = () => (
  <View style={styles.scrollContainer}>
    <Text style={styles.header}>Dashboard</Text>
    <Text style={styles.sectionTitle}>Today’s modules</Text>
    <View style={styles.card}><Text>today’s modules</Text></View>
    <Text style={styles.sectionTitle}>Weekly attendance progress</Text>
    <View style={styles.card}><Text>weekly attendance progress</Text></View>
    <TouchableOpacity style={styles.smallButton}><Text>report overview</Text></TouchableOpacity>
    <TouchableOpacity style={styles.smallButton}><Text>get calendar</Text></TouchableOpacity>
  </View>
); */

const StudentCard = () => (
  <View style={styles.centeredContainer}>
    <View style={styles.card}><Text style={styles.cardText}>student card</Text></View>
    <Text>activate card</Text>
  </View>
);

/* const StudentReport  = () => (
  <View style={styles.scrollContainer}>
    <Text style={styles.header}>Report</Text>
    <Text style={styles.subHeader}>MONTH ▼</Text>
    <View style={styles.reportRow}><Text>Day, Date</Text><Text>Module</Text><Text>Status</Text></View>
    <View style={styles.reportRow}><Text>Day, Date</Text><Text>Module</Text><Text>Status</Text></View>
    <View style={styles.reportRow}><Text>Day, Date</Text><Text>Module</Text><Text>Status</Text></View>
  </View>
); */

const StudentCalendar = () => (
  <View style={styles.centeredContainer}>
    <Text style={styles.header}>Calendar</Text>
    <View style={styles.card}><Text style={styles.cardText}>calendar</Text></View>
    <TouchableOpacity style={styles.smallButton}><Text>save changes</Text></TouchableOpacity>
    <TouchableOpacity style={styles.smallButton}><Text>discard changes</Text></TouchableOpacity>
  </View>
);


// Lecturer-specific screens
const LecturerDashboard = () => (
  <View style={styles.scrollContainer}>
    <Text style={styles.header}>Dashboard</Text>
    <Text style={styles.sectionTitle}>Set Today’s Modules</Text>
    <TouchableOpacity style={styles.card}><Text style={styles.cardText}>tap to generate</Text></TouchableOpacity>
  </View>
);

const LecturerCard  = () => (
  <View style={styles.centeredContainer}>
    <View style={styles.card}><Text style={styles.cardText}>lecturer card</Text></View>
    <Text>activate card</Text>
  </View>
);

const LecturerReport = () => (
  <View style={styles.scrollContainer}>
    <Text style={styles.header}>Reports</Text>
    <Text style={styles.subHeader}>MONTH ▼</Text>
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.reportRow}>
        <Text>Day, Date</Text>
        <Text>Module</Text>
        <Text>Status</Text>
      </View>
    ))}
    <TouchableOpacity style={styles.smallButton}><Text>Reason for override</Text></TouchableOpacity>
  </View>
);

const LecturerCalendar = () => (
  <View style={styles.centeredContainer}>
    <Text style={styles.header}>Calendar</Text>
    <View style={styles.card}><Text style={styles.cardText}>calendar</Text></View>
    <TouchableOpacity style={styles.smallButton}><Text>save changes</Text></TouchableOpacity>
    <TouchableOpacity style={styles.smallButton}><Text>discard changes</Text></TouchableOpacity>
  </View>
);

type MainTabsProps = {
  route: RouteProp<RootTabParamList, 'Main'>;
};

const MainTabs: React.FC = () => {
  const route = useRoute<RouteProp<RootTabParamList, 'Main'>>();
  const { role } = route.params;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {role === 'student' ? (
        <>
          <Tab.Screen name="Dashboard" component={StudentsDashboard} />
          <Tab.Screen name="Card" component={StudentCard} />
          <Tab.Screen name="Report" component={StudentsReports} />
          <Tab.Screen name="Calendar" component={StudentCalendar} />
        </>
      ) : (
        <>
          <Tab.Screen name="Dashboard" component={LecturerDashboard} />
          <Tab.Screen name="LecturerCard" component={LecturerCard} />
          <Tab.Screen name="Report" component={LecturerReport} />
          <Tab.Screen name="Calendar" component={LecturerCalendar} />
        </>
      )}
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <StackNav.Navigator screenOptions={{ headerShown: false }}>
        <StackNav.Screen name="Login" component={LoginScreen} />
        <StackNav.Screen name="Auth" component={AuthScreen} /> 
        <StackNav.Screen name="AuthLecturer" component={AuthScreenLect} />
        <StackNav.Screen name="Main" component={StudentsDashboard} />
        <StackNav.Screen name="Calendar" component={StudentsCalandar} />
        <StackNav.Screen name="Report" component={StudentsReports} />        
        <StackNav.Screen name="MainLecturer" component={LecturersDashboard} />
      </StackNav.Navigator>
    </NavigationContainer>
  );
}
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

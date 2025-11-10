// App.tsx

import React, { useState } from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native'; // Import RouteProp
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


const StackNav = createNativeStackNavigator<RootTabParamList>(); // Use the param list
const Tab = createBottomTabNavigator();
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types'; // Import your types
import AuthScreen from './AuthScreen';
//import AuthScreenLec from './AuthScreenLect.tsx';
// import BLEReceiver from './BLEReceiver.tsx'; // No longer needed
import LecturersDashboard from './LecturerDashboard.tsx';
import StudentsDashboard from './StudentDashboard';
import StudentsCalandar from './StudentsCalendar';
import StudentsReports from './StudentsReports'
import LecturersReports from './LecturerReports.tsx';
import CreateUser from './CreateUser.tsx';
import AdminsDashboard from './AdminDashboard.tsx';
import StudentAttendances from './StudentAttendance.tsx';
import LecturerAttendance from './LecturerAttendance.tsx';
import CreateModule from './CreateModule.tsx';
import StudentModules from './StudentModules.tsx';
import LecturerModules from './LecturerModules.tsx';
import CreateLesson from './CreateLesson.tsx';
import LecturerLessons from './LecturerLessons.tsx';
import LessonActivity from './LessonActivity.tsx';
import Modules from './Modules.tsx';
// import StudentBottomNav from './BottomNav.tsx'; // This is in StudentDashboard
import LecturersCalendar from './LecturersCalendar.tsx';
import LecturerQrCamera from './LecturerQrCamera.tsx';
import StudentQrCamera from './StudentQrCamera.tsx';
import Settings from './Settings.tsx';
import TermsAndConditions from './TermsAndConditions.tsx';
import About from './About.tsx';
import ChangeStudentPassword from './ChangeStudentPassword.tsx';
import ChangeLecturerPassword from './ChangeLecturerPassword.tsx';

// Login Screen (Unchanged)
const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootTabParamList>>();
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.logo}>Tapify</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Auth', { role: 'student' })}>
        <Text style={styles.buttonText}>Login as Student</Text>
      </TouchableOpacity>
    </View>
  );
};


// --- THIS COMPONENT IS UPDATED ---
// Main role-based screen
const Main: React.FC<{ route: RouteProp<RootTabParamList, 'Main'> }> = ({ route }) => {
  // Now we get all params from the route
  const { role, lessonID, studentNumber } = route.params;

  if (role === 'student') { // Use 'Student' (capitalized) to match types
    // Pass the params down as props
    return <StudentsDashboard 
              role={role} 
              lessonID={lessonID} 
              studentNumber={studentNumber} 
            />;
  }
  if (role === 'lecturer') return <LecturersDashboard />;
  if (role === 'admin') return <AdminsDashboard />;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>No role specified</Text>
    </View>
  );
};
// --- END OF UPDATE ---


export default function App() {
  return (
    <NavigationContainer>
      {/* Use the typed stack navigator */}
      <StackNav.Navigator screenOptions={{ headerShown: false }} initialRouteName="Auth">
        <StackNav.Screen name="Login" component={LoginScreen} />
        <StackNav.Screen name="CreateUser" component={CreateUser} />
        <StackNav.Screen name="CreateModule" component={CreateModule} />
        <StackNav.Screen name="Auth" component={AuthScreen} /> 
        <StackNav.Screen name="Main" component={Main} />
        <StackNav.Screen name="Calendar">
        {({ route }: any) => {
          const role = route.params?.role;
          return role === 'Lecturer' ? <LecturersCalendar /> : <StudentsCalandar />;
        }}
        </StackNav.Screen>
        <StackNav.Screen name="Report" component={StudentsReports} />        
        <StackNav.Screen name="MainLecturer" component={LecturersDashboard} />
        <StackNav.Screen name="MainAdmin" component={AdminsDashboard} />
        <StackNav.Screen name="ReportLecturer" component={LecturersReports} />
        <StackNav.Screen name="StudentAttendance" component={StudentAttendances} />
        <StackNav.Screen name="LecturerAttendance" component={LecturerAttendance} />
        <StackNav.Screen name="StudentModules" component={StudentModules} />
        <StackNav.Screen name="LecturerModules" component={LecturerModules} />
        <StackNav.Screen name="LecturerLessons" component={LecturerLessons} />
        <StackNav.Screen name="CreateLesson" component={CreateLesson} />
        <StackNav.Screen name="LessonActivity" component={LessonActivity} />
        <StackNav.Screen name="Modules" component={Modules} />
        <StackNav.Screen name="QrCamera">
        {({ route }: any) => {
          const role = route.params?.role;
          return role === 'Lecturer' ? <LecturerQrCamera /> : <StudentQrCamera />;
        }}
        </StackNav.Screen>
        <StackNav.Screen name="Settings" component={Settings} /> 
        <StackNav.Screen name="TermsAndConditions" component={TermsAndConditions} /> 
        <StackNav.Screen name="About" component={About} /> 
        <StackNav.Screen name="ChangeStudentPassword" component={ChangeStudentPassword} /> 
        <StackNav.Screen name="ChangeLecturerPassword" component={ChangeLecturerPassword} /> 
      </StackNav.Navigator>
    </NavigationContainer>
  );
}
// --- STYLES (CLEANED) ---
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
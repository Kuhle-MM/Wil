import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';

type LoginScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.logo}>tapify</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.buttonText}>login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>register</Text>
      </TouchableOpacity>
    </View>
  );
};

const StudentCardScreen = () => (
  <View style={styles.centeredContainer}>
    <View style={styles.card}><Text style={styles.cardText}>student card</Text></View>
    <Text style={styles.linkText}>activate card</Text>
  </View>
);

const DashboardScreen = () => (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <Text style={styles.header}>Dashboard</Text>
    <Text style={styles.sectionTitle}>Today’s modules</Text>
    <View style={styles.card}><Text>today’s modules</Text></View>
    <Text style={styles.sectionTitle}>Weekly attendance progress</Text>
    <View style={styles.card}><Text>weekly attendance progress</Text></View>
    <TouchableOpacity style={styles.smallButton}><Text>report overview</Text></TouchableOpacity>
    <TouchableOpacity style={styles.smallButton}><Text>get calendar</Text></TouchableOpacity>
  </ScrollView>
);

const ReportScreen = () => (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <Text style={styles.header}>Report</Text>
    <Text style={styles.subHeader}>MONTH ▼</Text>
    <View style={styles.reportRow}><Text>Day, Date</Text><Text>Module</Text><Text>Status</Text></View>
    <View style={styles.reportRow}><Text>Day, Date</Text><Text>Module</Text><Text>Status</Text></View>
    <View style={styles.reportRow}><Text>Day, Date</Text><Text>Module</Text><Text>Status</Text></View>
  </ScrollView>
);

const CalendarScreen = () => (
  <View style={styles.centeredContainer}>
    <Text style={styles.header}>Calendar</Text>
    <View style={styles.card}><Text style={styles.cardText}>calendar</Text></View>
    <TouchableOpacity style={styles.smallButton}><Text>save changes</Text></TouchableOpacity>
    <TouchableOpacity style={styles.smallButton}><Text>discard changes</Text></TouchableOpacity>
  </View>
);

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={DashboardScreen} />
    <Tab.Screen name="Card" component={StudentCardScreen} />
    <Tab.Screen name="Report" component={ReportScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
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
  linkText: {
    fontSize: 16,
    color: 'blue',
    marginTop: 12,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, CommonActions, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import Icon from 'react-native-vector-icons/Ionicons';


type StudentNavProp = NativeStackNavigationProp<RootTabParamList>;

type BottomNavProps = {
  navigation: StudentNavProp;
  role: 'student' | 'lecturer' | 'admin';
};

const StudentBottomNav: React.FC<BottomNavProps> = ({ navigation, role }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Main', { role })}>
        <Icon name="home-outline" style={styles.homeIcon} size={50} color="#000" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('StudentAttendance', { role})}>
        <Icon name="time-outline" style={styles.ClockInIcon} size={50} color="#000" />
        <Text style={styles.navText}>Clock In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Report',  { role })}>
        <Icon name="document-text-outline" style={styles.ReportIcon} size={50} color="#000" />
        <Text style={styles.navText}>Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Calendar',  { role })}>
        <Icon name="calendar-outline" style={styles.CalandarIcon} size={50} color="#000" />
        <Text style={styles.navText}>Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Report',  { role })}>
        <Icon name="settings-outline" style={styles.SettingsIcon} size={50} color="#000" />
        <Text style={styles.navText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StudentBottomNav;

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#FFDCC6',
    },
    navItem: { 
        alignItems: 'center',
    },
    navText: { 
        fontSize: 15, 
        marginTop: 2,
        fontWeight: 'bold',
    },
  homeIcon: {
    borderRadius: 50,
    padding: 5,
    backgroundColor: '#FDFFBA'
  },
  ClockInIcon: {
    borderRadius: 50,
    padding: 5,
    backgroundColor: '#B8EBD8'
  },
  ReportIcon: {
    borderRadius: 50,
    padding: 5,
    backgroundColor: '#FFBBB8'
  },
  CalandarIcon: {
    borderRadius: 50,
    padding: 5,
    backgroundColor: '#B8EBD8'
  },
  SettingsIcon: {
    borderRadius: 50,
    padding: 5,
    backgroundColor: '#FDFFBA'
  }
});
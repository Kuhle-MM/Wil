import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import Icon from 'react-native-vector-icons/Ionicons';

type StudentNavProp = NativeStackNavigationProp<RootTabParamList>;

type BottomNavProps = {
  navigation: StudentNavProp;
  role: 'student' | 'lecturer' | 'admin';
};

const StudentBottomNav: React.FC<BottomNavProps> = ({ navigation, role }) => {
  if (role === "Student"){
    
  return (
    
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Main', { role })}>
        <Icon name="home-outline" style={[styles.icon, styles.iconBlue]} size={32} color="#064f62" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('StudentAttendance', { role })}>
        <Icon name="time-outline" style={[styles.icon, styles.iconGreen]} size={32} color="#064f62" />
        <Text style={styles.navText}>Clock In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Report', { role })}>
        <Icon name="document-text-outline" style={[styles.icon, styles.iconBlue]} size={32} color="#064f62" />
        <Text style={styles.navText}>Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Calendar', { role })}>
        <Icon name="calendar-outline" style={[styles.icon, styles.iconGreen]} size={32} color="#064f62" />
        <Text style={styles.navText}>Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings', { role })}>
        <Icon name="settings-outline" style={[styles.icon, styles.iconBlue]} size={32} color="#064f62" />
        <Text style={styles.navText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}
if (role === "Lecturer"){
    
  return (
    
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainLecturer', { role })}>
        <Icon name="home-outline" style={[styles.icon, styles.iconBlue]} size={32} color="#064f62" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LecturerAttendance')}>
        <Icon name="time-outline" style={[styles.icon, styles.iconGreen]} size={32} color="#064f62" />
        <Text style={styles.navText}>Clock In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ReportLecturer')}>
        <Icon name="document-text-outline" style={[styles.icon, styles.iconBlue]} size={32} color="#064f62" />
        <Text style={styles.navText}>Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Calendar', { role })}>
        <Icon name="calendar-outline" style={[styles.icon, styles.iconGreen]} size={32} color="#064f62" />
        <Text style={styles.navText}>Calendar</Text>
      </TouchableOpacity>

       <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LecturerModules', { role })}>
        <Icon name="calendar-outline" style={[styles.icon, styles.iconGreen]} size={32} color="#064f62" />
        <Text style={styles.navText}>Modules</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LecturerLessons', { role })}>
        <Icon name="calendar-outline" style={[styles.icon, styles.iconGreen]} size={32} color="#064f62" />
        <Text style={styles.navText}>Lessons</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings', { role })}>
        <Icon name="settings-outline" style={[styles.icon, styles.iconBlue]} size={32} color="#064f62" />
        <Text style={styles.navText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}
else if (role === "Admin"){
    
  return (
    
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainAdmin', { role })}>
        <Icon name="home-outline" style={[styles.icon, styles.iconBlue]} size={32} color="#064f62" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Modules', { role })}>
        <Icon name="document-text-outline" style={[styles.icon, styles.iconBlue]} size={32} color="#064f62" />
        <Text style={styles.navText}>Modules</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('CreateModule', { role })}>
        <Icon name="calendar-outline" style={[styles.icon, styles.iconGreen]} size={32} color="#064f62" />
        <Text style={styles.navText}>Add a Module</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings', { role })}>
        <Icon name="settings-outline" style={[styles.icon, styles.iconBlue]} size={32} color="#064f62" />
        <Text style={styles.navText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}
};

export default StudentBottomNav;

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#aeacab', // silver
    backgroundColor: '#064f62', 
    shadowColor: '#064f62',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    borderRadius: 50,
    padding: 10,
    marginBottom: 4,
  },
  iconBlue: {
    backgroundColor: '#6bbfe4', // sky-blue
  },
  iconGreen: {
    backgroundColor: '#a4c984', // pistachio
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white', 
  },
});

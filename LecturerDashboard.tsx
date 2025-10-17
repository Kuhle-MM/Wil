import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const LecturerDashboard: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;

  const [lecturerName, setLecturerName] = useState<string>('Lecturer');
  const [todaysLessons, setTodaysLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);

  useEffect(() => {
  const fetchTodaysLessons = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (!session) return;

        const user = JSON.parse(session);
        const lecturerID = user.studentNumber;
        setLecturerName(user.name || 'Lecturer');

        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/lecturer_timetable/${lecturerID}`
        );
        if (!response.ok) throw new Error('Failed to fetch timetable');

        const data = await response.json();

        const today = new Date();
        const todays = data.filter((lesson: any) => {
          const lessonDate = new Date(lesson.date);
          return lessonDate.toDateString() === today.toDateString();
        });

        setTodaysLessons(todays);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchTodaysLessons();
  }, []);


  const handleReport = () => navigation.navigate('ReportLecturer');
  const handleCalendar = () => navigation.navigate('Calendar', { role });
  const handleAttendance = () => navigation.navigate('LecturerAttendance');
  const handleModule = () => navigation.navigate('LecturerModules', { role });
  const handleLesson = () => navigation.navigate('LecturerLessons', { role });

  return (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.header}>Dashboard</Text>
      <Text style={styles.sectionTitle}>Today’s Modules</Text>

      <View style={styles.card}>
        {loadingLessons ? (
          <ActivityIndicator size="large" color="#4caf50" />
        ) : todaysLessons.length === 0 ? (
          <Text style={styles.cardText}>No lessons scheduled for today 🎉</Text>
        ) : (
          todaysLessons.map((lesson, index) => (
            <Text key={index} style={styles.cardText}>
              {lesson.moduleCode} — {new Date(lesson.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.smallButton} onPress={handleReport}>
        <Text>Report Overview</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.smallButton} onPress={handleAttendance}>
        <Text>Clock In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.smallButton} onPress={handleModule}>
        <Text>Your Modules</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.smallButton} onPress={handleLesson}>
        <Text>Your Lessons</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LecturerDashboard;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
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
  smallButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
    alignItems: 'center',
  },
});

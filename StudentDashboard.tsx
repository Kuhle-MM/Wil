import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StudentBottomNav from './BottomNav.tsx';
import * as Progress from 'react-native-progress';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const StudentDashboard: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;

  const [studentName, setStudentName] = useState<string>('');
  const [progressData, setProgressData] = useState<{ Attended: number; TotalLessons: number; AttendancePercentage: number } | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [todaysModules, setTodaysModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (!session) return;

        const user = JSON.parse(session);
        const studentId = user.studentNumber;

        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Access/get_details_students?id=${studentId}`
        );

        if (!response.ok) return;

        const text = await response.text();
        const IdMatch = text.match(/ID:\s*(\w+)/);
        if (IdMatch) setStudentName(`${IdMatch[1]}`);

        fetchWeeklyProgress(studentId);
        fetchTodaysModules(studentId);
      } catch (error) {
        console.error('Error fetching student details', error);
      }
    };

    const fetchTodaysModules = async (studentId: string) => {
      try {
        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/student_timetable/${studentId.toUpperCase()}`
        );
        if (!response.ok) throw new Error('Failed to fetch timetable');
        const data = await response.json();

        const today = new Date();
        const todays = data.filter((lesson: any) => {
          const lessonUTC = new Date(lesson.date);
          const lessonSA = new Date(lessonUTC.getTime() + 2 * 60 * 60 * 1000);
          return lessonSA.toDateString() === today.toDateString();
        });

        setTodaysModules(todays);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoadingModules(false);
      }
    };

    const fetchWeeklyProgress = async (studentId: string) => {
      try {
        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api/StudentClocking/progress/${studentId.toUpperCase()}`
        );
        if (!response.ok) throw new Error('Failed to fetch progress');
        const data = await response.json();
        setProgressData({
          Attended: data.attended,
          TotalLessons: data.totalLessons,
          AttendancePercentage: data.attendancePercentage,
        });
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchStudentDetails();
  }, []);

  const handleReport = () => navigation.navigate('Report', { role });
  const handleCalendar = () => navigation.navigate('Calendar', { role });
  const handleAttendance = () => navigation.navigate('StudentAttendance', { role });
  const handleModule = () => navigation.navigate('StudentModules', { role });
  const handleHome = () => navigation.navigate('Main', { role });
  const handleBLE = () => navigation.navigate('BLEReceiver', {role});////////////////////////////////////////////////////////


  return (
    <ImageBackground
      source={require('./assets/images/BackgroundImage.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.header}>📙 Your Dashboard</Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today’s Modules</Text>
          {loadingModules ? (
            <ActivityIndicator size="large" color="#064f62" />
          ) : todaysModules.length === 0 ? (
            <Text style={styles.cardText}>No modules scheduled for today 🎉</Text>
          ) : (
            todaysModules.map((lesson, index) => {
              const lessonUTC = new Date(lesson.date);
              const lessonSA = new Date(lessonUTC.getTime() - 2 * 60 * 60 * 1000);
              const lessonTime = lessonSA.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <Text key={index} style={styles.cardText}>
                  {lesson.moduleCode} — {lessonTime}
                </Text>
              );
            })
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Weekly Attendance Progress</Text>
          {loadingProgress ? (
            <ActivityIndicator size="large" color="#064f62" />
          ) : progressData ? (
            <>
              <Text style={styles.cardText}>
                {progressData.Attended} / {progressData.TotalLessons} lessons attended
              </Text>
              <Progress.Bar
                progress={progressData.AttendancePercentage / 100}
                width={330}
                height={18}
                color="#064f62"
                borderRadius={8}
                style={{ marginTop: 10 }}
              />
              <Text style={[styles.cardText, { marginTop: 5 }]}>
                {progressData.AttendancePercentage.toFixed(2)}%
              </Text>
            </>
          ) : (
            <Text style={styles.cardText}>No progress data available</Text>
          )}
        </View>

        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.gridButton} onPress={handleAttendance}>
            <Text style={styles.gridEmoji}>⏰</Text>
            <Text style={styles.gridLabel}>Clock In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={handleReport}>
            <Text style={styles.gridEmoji}>📊</Text>
            <Text style={styles.gridLabel}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={handleBLE}>{/* //////////////////////////////////////// */}
           
            <Text style={styles.gridText}>Open BLE Scanner</Text>
          </TouchableOpacity>{/* //////////////////////////////////////// */}

          <TouchableOpacity style={styles.gridButton} onPress={handleCalendar}>
            <Text style={styles.gridEmoji}>🗓️</Text>
            <Text style={styles.gridLabel}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={handleModule}>
            <Text style={styles.gridEmoji}>📘</Text>
            <Text style={styles.gridLabel}>Your Modules</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <StudentBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </ImageBackground>
  );
};

export default StudentDashboard;

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  scrollContainer: { flex: 1, padding: 16 },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2E2E2E',
    marginTop: 60,
    marginBottom: 30,
  },
  headerCard: {
    backgroundColor: '#064f62',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subHeader: { color: '#d8f3dc', fontSize: 18 },
  sectionCard: {
    backgroundColor: '#A4C984',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#064f62',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardText: { color: '#000', fontSize: 17, fontWeight: '500', textAlign: 'center' },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  gridButton: {
    width: '48%',
    backgroundColor: '#064f62',
    borderRadius: 16,
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 150,
  },
  gridImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  gridText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    paddingVertical: 4,
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
    backgroundColor: 'black', 
    padding: 10, 
    borderRadius: 6, 
    marginVertical: 6, 
    alignItems: 'center', 
  }, buttonText: { 
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#B8EBD8',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 2,
  },
});

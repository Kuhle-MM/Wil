import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground, ActivityIndicator } from 'react-native';
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

        if (!response.ok) {
          console.error('Failed to fetch student details');
          return;
        }

        const text = await response.text();
        const IdMatch = text.match(/ID:\s*(\w+)/);
        if (IdMatch) {
          setStudentName(`${IdMatch[1]}`);
        }

        // Fetch weekly progress and today's modules
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

        // Filter lessons that are today
        const today = new Date();
        const todays = data.filter((lesson: any) => {
          const lessonUTC = new Date(lesson.date);
          const lessonSA = new Date(lessonUTC.getTime() + 2 * 60 * 60 * 1000); // UTC → SA +2h
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
        const response = await fetch(`https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api/StudentClocking/progress/${studentId.toUpperCase()}`);
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

  return (
    <ImageBackground
      source={require('./assets/images/BackgroundImage.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.scrollContainer}>
        <Text style={styles.header}>{studentName || 'Student'}'s Dashboard</Text>

        <Text style={styles.sectionTitle}>Today’s Modules</Text>
        <View style={styles.card}>
          {loadingModules ? (
            <ActivityIndicator size="large" color="#4caf50" />
          ) : todaysModules.length === 0 ? (
            <Text style={styles.cardText}>No modules scheduled for today 🎉</Text>
          ) : (
            todaysModules.map((lesson, index) => {
              const lessonUTC = new Date(lesson.date);
              const lessonSA = new Date(lessonUTC.getTime() - 2 * 60 * 60 * 1000); // UTC → SA +2h
              const lessonTime = lessonSA.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <Text key={index} style={styles.cardText}>
                  {lesson.moduleCode} — {lessonTime}
                </Text>
              );
            })
          )}
        </View>

        <Text style={styles.sectionTitle}>Weekly attendance progress</Text>
        <View style={styles.card}>
          {loadingProgress ? (
            <ActivityIndicator size="large" color="#4caf50" />
          ) : progressData ? (
            <>
              <Text style={styles.cardText}>
                {progressData.Attended} / {progressData.TotalLessons} lessons attended
              </Text>
              <Progress.Bar
                progress={progressData.AttendancePercentage / 100}
                width={350}
                height={20}
                color="#4caf50"
                borderRadius={10}
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
            <Image source={require('./assets/images/clockin.jpg')} style={styles.gridImage} resizeMode="cover" />
            <Text style={styles.gridText}>Clock In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={handleReport}>
            <Image source={require('./assets/images/report.jpg')} style={styles.gridImage} resizeMode="cover" />
            <Text style={styles.gridText}>Report Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={handleCalendar}>
            <Image source={require('./assets/images/calendar.jpg')} style={styles.gridImage} resizeMode="cover" />
            <Text style={styles.gridText}>Get Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={handleModule}>
            <Image source={require('./assets/images/modules.jpg')} style={styles.gridImage} resizeMode="cover" />
            <Text style={styles.gridText}>Your Modules</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StudentBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </ImageBackground>
  );
};

export default StudentDashboard;

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  scrollContainer: { flex: 1, padding: 16 },
  header: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 25, marginVertical: 8, fontWeight: '500' },
  card: { width: '100%', padding: 10, backgroundColor: 'black', borderRadius: 12, marginBottom: 16, alignItems: 'center' },
  cardText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 10 },
  gridButton: { width: '48%', borderRadius: 8, marginVertical: 10, overflow: 'hidden', backgroundColor: '#000', alignItems: 'center', justifyContent: 'flex-end', height: 150 },
  gridImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  gridText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', paddingVertical: 4 },
});

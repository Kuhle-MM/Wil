import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { useRoute, CommonActions, useNavigation, RouteProp } from '@react-navigation/native';
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

        // Fetch weekly progress
        fetchWeeklyProgress(studentId);
        // Fetch today's modules
        fetchTodaysModules(studentId);

      } catch (error) {
        console.error('Error fetching student details', error);
      }
    };

    const fetchTodaysModules = async (studentId: string) => {
      try {
        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/student_timetable/${studentId}`
        );

        if (!response.ok) throw new Error('Failed to fetch timetable');
        const data = await response.json();

        // Get today's date
        const today = new Date();
        const todayDateOnly = today.toISOString().split('T')[0];

        // Filter lessons that are today
        const todays = data.filter((lesson: any) => {
          const lessonDate = new Date(lesson.date).toISOString().split('T')[0];
          return lessonDate === todayDateOnly;
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
        const response = await fetch(`https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/StudentClocking/progress/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch progress');
        const data = await response.json();
        setProgressData({
          Attended: data.Attended,
          TotalLessons: data.TotalLessons,
          AttendancePercentage: data.AttendancePercentage,
        });
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchStudentDetails();
  }, []);

  const handleReport = () => navigation.navigate('Report',  { role });
  const handleCalendar = () => navigation.navigate('Calendar',  { role });
  const handleAttendance = () => navigation.navigate('StudentAttendance',  { role });
  const handleModule = () => navigation.navigate('StudentModules', { role });
  const handleHome = () => navigation.navigate('Main', { role });

  return (
    <ImageBackground
      source={require('./assets/images/BackgroundImage.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover" 
    >
      {/* Main Content */}
      <View style={styles.scrollContainer}> 
        <Text style={styles.header}> {studentName || 'Student'}'s Dashboard</Text> 
        <Text style={styles.sectionTitle}>Today’s Modules</Text>

        <View style={styles.card}>
          {loadingModules ? (
            <ActivityIndicator size="large" color="#4caf50" />
          ) : todaysModules.length === 0 ? (
            <Text style={styles.cardText}>No modules scheduled for today 🎉</Text>
          ) : (
            todaysModules.map((lesson, index) => (
              <Text key={index} style={styles.cardText}>
                {lesson.moduleCode} — {new Date(lesson.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            ))
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Weekly attendance progress</Text>
        <View style={styles.card}>
          {/* Show a progress bar */}
          <Text style={styles.cardText}>
            3 / 5 lessons attended {/*{progressData.Attended} / {progressData.TotalLessons} lessons attended*/}
          </Text>
          <Progress.Bar
            progress={3 / 5} // {progressData.AttendancePercentage / 100}
            width={350}
            height={20}
            color="#4caf50"
            borderRadius={10}
            style={{ marginTop: 10 }}
          />
          <Text style={[styles.cardText, { marginTop: 5 }]}>
            60% {/*{progressData.AttendancePercentage.toFixed(2)}%*/}
          </Text>
        </View>

        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.gridButton} onPress={handleAttendance}>
            <Image
              source={require('./assets/images/clockin.jpg')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Clock In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={handleReport}>
            <Image
              source={require('./assets/images/report.jpg')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Report Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={handleCalendar}>
            <Image
              source={require('./assets/images/calendar.jpg')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Get Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={handleModule}>
            <Image
              source={require('./assets/images/modules.jpg')}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <Text style={styles.gridText}>Your Modules</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom navbar */}
      <StudentBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </ImageBackground>
  );
};

export default StudentDashboard;

const styles = StyleSheet.create({ 
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
  flex: 1,             
  backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,              
    padding: 16,
  },
    logo: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    marginBottom: 40, 
  }, 
  header: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginTop: 20, 
    marginBottom: 16, 
  }, 
  subHeader: { 
    fontSize: 18, 
    marginVertical: 8, 
  }, 
  sectionTitle: { 
    fontSize: 25, 
    marginVertical: 8, 
    fontWeight: '500'
  }, 
  card: { 
    width: '100%', 
    padding: 10, 
    backgroundColor: 'black', 
    borderRadius: 12, 
    marginBottom: 16, 
    alignItems: 'center', 
  }, 
  cardText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold'
  }, 
  buttonGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginVertical: 10,
  },
  gridButton: {
    width: '48%',
    borderRadius: 8,
    marginVertical: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
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
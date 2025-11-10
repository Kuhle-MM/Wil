// StudentsDashboard.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
  ActivityIndicator,
  PermissionsAndroid, 
  Platform, 
} from 'react-native';
import {
  useNavigation,
  useFocusEffect, 
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { BleManager, State } from 'react-native-ble-plx'; 

import StudentBottomNav from './BottomNav';
import { RootTabParamList } from './types';

// --- 1. BLE CONFIGURATION ---
const API_BASE_URL = "https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net";
const PING_TARGET = 3;
const bleManager = new BleManager();
// ----------------------------

// --- 2. DEFINE PROPS ---
type StudentDashboardProps = {
  role: 'student' | 'lecturer' | 'admin'; // Capitalized to match App.tsx
  lessonID?: string;
  studentNumber?: string; // This will come from 'Main'
};

type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

// --- 3. UPDATE COMPONENT SIGNATURE ---
const StudentDashboard: React.FC<StudentDashboardProps> = (props) => {
  const navigation = useNavigation<AuthNavProp>();
  
  // --- 4. GET PROPS ---
  const { role, lessonID, studentNumber: propStudentNumber } = props;

  // --- States ---
  const [studentName, setStudentName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>(''); // Internal state for studentId
  const [progressData, setProgressData] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [todaysModules, setTodaysModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  
  // --- BLE STATES AND REFS ---
  const [bleStatus, setBleStatus] = useState<string | null>(null);
  const [pingsReceived, setPingsReceived] = useState<boolean[]>([false, false, false]);
  const scannedLessonIDRef = useRef<string | null>(null);
  const isScanning = useRef(false);
  
  // --- 5. useEffect (for loading student data) ---
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        let sId = propStudentNumber; 
        if (!sId) {
          const session = await AsyncStorage.getItem('userSession');
          if (!session) return;
          const user = JSON.parse(session);
          sId = user.studentNumber;
        }
        
        if (!sId) {
          Alert.alert("Error", "Could not find student ID.");
          return;
        }

        const sIdUpper = sId.toUpperCase();
        setStudentId(sIdUpper); // Set the internal state

        const response = await fetch(
          `${API_BASE_URL}/Access/get_details_students?id=${sId}`
        );

        if (!response.ok) throw new Error('Failed to fetch student details');
        const text = await response.text();
        const nameMatch = text.match(/Name:\s*(\w+)/i);
        if (nameMatch) setStudentName(nameMatch[1]);
        else {
          const session = await AsyncStorage.getItem('userSession');
          const user = session ? JSON.parse(session) : {};
          setStudentName(user.username || 'Student');
        }

        fetchWeeklyProgress(sIdUpper);
        fetchTodaysModules(sIdUpper);
      } catch (error: any) {
        console.error('Error fetching student details:', error);
        Alert.alert('Error', error.message || 'Failed to load student info.');
      }
    };

    const fetchTodaysModules = async (studentId: string) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/Lesson/student_timetable/${studentId}`
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
          console.error('Error fetching timetable:', error);
        } finally {
          setLoadingModules(false);
        }
      };
    const fetchWeeklyProgress = async (studentId: string) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/StudentClocking/progress/${studentId}`
          );
          if (!response.ok) throw new Error('Failed to fetch progress');
          const data = await response.json();
          setProgressData({
            Attended: data.attended,
            TotalLessons: data.totalLessons,
            AttendancePercentage: data.attendancePercentage,
          });
        } catch (error: any) {
          console.error('Error fetching progress:', error);
        } finally {
          setLoadingProgress(false);
        }
    };

    fetchStudentDetails();
  }, [propStudentNumber]); // Runs when the prop changes

  // --- 6. useFocusEffect (to manage BLE scanning) ---
  useFocusEffect(
    useCallback(() => {
      // Check if we just arrived from the QR scanner
      if (lessonID && lessonID !== scannedLessonIDRef.current) {
        console.log(`Dashboard focused with NEW lessonID: ${lessonID}`);
        scannedLessonIDRef.current = lessonID;
        // Mark Ping 1 as done, and start scanning for 2 & 3
        setPingsReceived([true, false, false]); 
        setBleStatus("Searching for Ping 2/3...");
      } 
      // Or, if we are returning to the app and a scan was already in progress
      else if (scannedLessonIDRef.current) {
        console.log("Dashboard focused, resuming scan for pings.");
        startBleScan();
      }

      // Cleanup function: runs when user navigates *away*
      return () => {
        console.log("Dashboard unfocused, stopping scan.");
        bleManager.stopDeviceScan();
        isScanning.current = false;
      };
    }, [lessonID]) // Re-run if the lessonID prop changes
  );

  // --- 7. useEffect (to react to state changes) ---
  useEffect(() => {
    // 'studentId' is our internal state, 'scannedLessonIDRef' is from the prop
    if (scannedLessonIDRef.current && studentId) {
      const allPingsDone = pingsReceived.every(p => p === true);
      
      if (allPingsDone) {
        handleSuccess();
      } else {
        // We need to scan for the *next* ping
        startBleScan();
      }
    }
  }, [pingsReceived, studentId]); // Runs when these states update

  // --- 8. BLE LOGIC (Pings 2 & 3) ---
  const startBleScan = async () => {
    if (isScanning.current) return; 
    if (!scannedLessonIDRef.current || !studentId) return; 

    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) { return setBleStatus("Bluetooth permission denied."); }
    
    const bleState = await bleManager.state();
    if (bleState !== State.PoweredOn) { return setBleStatus("Please turn on Bluetooth."); }
    
    isScanning.current = true;
    scanForDevice();
  };

  const scanForDevice = () => {
    const lessonID = scannedLessonIDRef.current;
    if (!lessonID) {
      isScanning.current = false;
      return;
    }

    const pingsFound = pingsReceived.filter(p => p).length;
    setBleStatus(`Scanning... (${pingsFound}/${PING_TARGET} pings found)`);
    
    bleManager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
      if (error) {
        if (!isScanning.current) return;
        console.error("BLE Scan Error:", error);
        handleFailure(error.message);
        return;
      }
      
      const deviceName = device?.name;
      if (!deviceName || !deviceName.startsWith(lessonID)) { return; }

      if (deviceName === `${lessonID}-2` && !pingsReceived[1]) {
        console.log("Found Ping 2");
        handleDeviceFound(1); 
      }
      else if (deviceName === `${lessonID}-3` && !pingsReceived[2]) {
        console.log("Found Ping 3");
        handleDeviceFound(2); 
      }
    });
  };

  const handleDeviceFound = (pingIndex: number) => {
    bleManager.stopDeviceScan();
    isScanning.current = false;
    sendApiRequest(pingIndex);
  };

  const sendApiRequest = async (pingIndex: number) => {
    const lessonID = scannedLessonIDRef.current;
    setBleStatus(`Ping ${pingIndex + 1}/${PING_TARGET} found. Sending proof...`);
    
    try {
      const url = `${API_BASE_URL}/api/Pinging/ReceiveReactPing`; 
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ LessonId: lessonID, StudentNumber: studentId }), 
      };

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      console.log(`Ping ${pingIndex + 1} sent successfully.`);
      
      setPingsReceived(currentPings => {
        const newPings = [...currentPings];
        newPings[pingIndex] = true;
        return newPings;
      });

    } catch (error) {
      console.error('API Ping failed:', error);
      handleFailure(`Ping ${pingIndex + 1} failed. Retrying...`);
    }
  };

  const handleSuccess = () => {
    setBleStatus(`Attendance Confirmed (${PING_TARGET}/${PING_TARGET} pings).`);
    scannedLessonIDRef.current = null; 
    isScanning.current = false;
    bleManager.stopDeviceScan();
    // After 5 seconds, hide the status bar
    setTimeout(() => setBleStatus(null), 5000);
  };

  const handleFailure = (errorMessage: string) => {
    setBleStatus(errorMessage);
    isScanning.current = false;
    bleManager.stopDeviceScan();
    setTimeout(startBleScan, 5000);
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') { return true; }
    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return (
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    return false;
  };
  // ------------------------------
  
  // --- 9. ORIGINAL Navigation handlers ---
  const handleReport = () => navigation.navigate('Report', { role });
  const handleCalendar = () => navigation.navigate('Calendar', { role });
  const handleAttendance = () => navigation.navigate('StudentAttendance', { role });
  const handleModule = () => navigation.navigate('StudentModules', { role });

  const handleQrCamera = () => {
    if (!studentId) {
      Alert.alert("Loading...", "Please wait for your details to load.");
      return;
    }
    navigation.navigate('QrCamera', {
      role: role,
      studentNumber: studentId, 
    });
  };
  // ------------------------------

  // --- 10. RENDER ---
  return (
    <ImageBackground
      source={require('./assets/images/BackgroundImage.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>
          {studentName ? `${studentName}'s Dashboard` : 'Student Dashboard'}
        </Text>

        {/* Today’s Modules (Unchanged) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today’s Modules</Text>
          {loadingModules ? (
            <ActivityIndicator size="large" color="#4caf50" />
          ) : todaysModules.length === 0 ? (
            <Text style={styles.cardText}>No modules scheduled for today 🎉</Text>
          ) : (
            todaysModules.map((lesson, index) => (
              <Text key={index} style={styles.cardText}>
                {lesson.moduleCode} —{' '}
                {new Date(lesson.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            ))
          )}
        </View>

        {/* Weekly Attendance Progress (Unchanged) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Weekly Attendance Progress</Text>
          {loadingProgress ? (
            <ActivityIndicator size="large" color="#4caf50" />
          ) : progressData ? (
            <>
              <Text style={styles.cardText}>
                {progressData.Attended} / {progressData.TotalLessons} lessons attended
              </Text>
              <Progress.Bar
                progress={progressData.AttendancePercentage / 100}
                width={290}
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
            <Text style={styles.cardText}>No progress data available.</Text>
          )}
        </View>

        {/* Buttons Grid (Unchanged) */}
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
          <TouchableOpacity style={styles.smallButton} onPress={handleQrCamera}>
            <Text style={styles.qrText}>Open QR Camera</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- 10. NEW: Silent BLE Status Bar --- */}
      {bleStatus && (
        <View style={styles.bleStatusBar}>
          <Text style={styles.bleStatusText}>{bleStatus}</Text>
        </View>
      )}
      {/* ------------------------------------- */}

      {/* Bottom Navigation */}
      <StudentBottomNav
        navigation={navigation}
        role={role} // Pass the 'role' prop
      />
    </ImageBackground>
  );
};

export default StudentDashboard;

// --- 11. STYLES (CLEANED) ---
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
  cardText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
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
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    position: 'absolute',
    opacity: 0.35,
  },
  gridText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  smallButton: {
    width: '100%',
    backgroundColor: '#A4C984',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  qrText: { color: '#064f62', fontSize: 16, fontWeight: '600' },
  // --- New Style for BLE Status Bar ---
  bleStatusBar: {
    backgroundColor: '#1C1C1E', // Dark color
    paddingVertical: 8,
    paddingHorizontal: 16,
    // Sits just above the bottom nav
  },
  bleStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SectionList,
  ImageBackground,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import StudentBottomNav from './BottomNav.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

// --- 1. UPDATED DATA MODEL ---
// This now matches your 'Reports' table in the API
type AttendanceRecord = {
  rowKey: string;
  lessonID: string;
  moduleCode: string;
  lessonDate: string; // The date we added in Step 1
  studentNumber: string;
  status: 'Present' | 'Absent' | string;
};
// ------------------------------

type SectionData = {
  title: string;
  data: AttendanceRecord[];
};

const StudentsReports: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;

  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  const getStudentId = async (): Promise<string | null> => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (session) {
        const { studentNumber } = JSON.parse(session);
        return studentNumber.toUpperCase();
      }
    } catch (e) {
      console.error('Failed to load student ID from storage', e);
    }
    return null;
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const studentNumber = await getStudentId();
        if (!studentNumber) throw new Error('Student ID not found. Please log in again.');

        // --- 2. UPDATED API URL ---
        // This now calls your new LessonController endpoint
        const url = `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/student_reports/${studentNumber}`;
        // --------------------------
        
        const response = await fetch(url);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to fetch attendance report.');
        }

        const result: AttendanceRecord[] = await response.json();
        const grouped = groupByDate(result);
        setSections(grouped);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const groupByDate = (records: AttendanceRecord[]): SectionData[] => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    const groups: Record<string, AttendanceRecord[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    records.forEach((rec) => {
      // --- 3. USE 'lessonDate' ---
      const recDate = new Date(rec.lessonDate); 
      // -------------------------
      const recDateStr = recDate.toDateString();

      if (recDateStr === todayStr) groups.Today.push(rec);
      else if (recDateStr === yesterdayStr) groups.Yesterday.push(rec);
      else groups.Earlier.push(rec);
    });

    return Object.entries(groups)
      .filter(([_, data]) => data.length > 0)
      .map(([title, data]) => ({
        title,
        data: data.sort(
          (a, b) =>
            new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime()
        ),
      }));
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} - ${hours}:${minutes}`;
  };

  // --- 4. UPDATED RENDERED ITEM ---
  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {/* Show Module Code and Lesson ID */}
        <View>
          <Text style={styles.moduleCode}>{item.moduleCode}</Text>
          <Text style={styles.lessonID}>{item.lessonID}</Text>
          <Text style={styles.clockTime}>{formatDateTime(item.lessonDate)}</Text>
        </View>
        {/* Status (Present/Absent) */}
        <View style={styles.statusContainer}>
          <Icon
            name={item.status === 'Present' ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={item.status === 'Present' ? '#4CAF50' : '#E53935'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.statusText,
              { color: item.status === 'Present' ? '#4CAF50' : '#E53935' },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
  // --------------------------------

  const renderSectionHeader = ({ section: { title } }: { section: SectionData }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  // --- 5. UPDATED CSV EXPORT ---
  const exportToCSV = async () => {
    try {
      if (sections.length === 0) return Alert.alert('No Attendances', 'No attendance records to export.');

      // ... (Android permission logic is unchanged) ...
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          // ... (permission details) ...
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return Alert.alert('Permission Denied', 'Storage permission is required.');
        }
      }

      // Flatten sections into one array with new fields
      const allRecords = sections.flatMap((sec) =>
        sec.data.map((item) => ({
          Date: formatDateTime(item.lessonDate),
          StudentNumber: item.studentNumber,
          Module: item.moduleCode,
          Lesson: item.lessonID,
          Status: item.status,
          Group: sec.title,
        }))
      );

      // Converting to CSV string with new headers
      const header = 'Date,Student Number,Module,Lesson,Status,Group\n';
      const csv = header + allRecords.map(r => `${r.Date},${r.StudentNumber},${r.Module},${r.Lesson},${r.Status},${r.Group}`).join('\n');
      // -----------------------------------

      const path = `${RNFS.DownloadDirectoryPath}/attendance_report.csv`;
      await RNFS.writeFile(path, csv, 'utf8');
      Alert.alert('Success', `Report saved to ${path}`);

      await Share.open({
        url: 'file://' + path,
        type: 'text/csv',
        showAppsToView: true,
      });
    } catch (err) {
      console.error('CSV Export Error:', err);
      Alert.alert('Error', 'Failed to export the report.');
    }
  };
  // ---------------------------------

  return (
    <ImageBackground
      source={require('./assets/images/BackgroundImage.jpg')}
      style={styles.background}
    >
      <View style={styles.mainContainer}>
        <View style={styles.contentWrapper}>
          <Text style={styles.header}>Attendance Report</Text>

          <TouchableOpacity style={styles.downloadButton} onPress={exportToCSV}>
            <Icon name="download-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.downloadText}>Download Spreadsheet</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#064f62" style={{ marginTop: 40 }} />
          ) : sections.length === 0 ? (
            <Text style={styles.noData}>No attendance records found.</Text>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.rowKey}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              contentContainerStyle={{ paddingBottom: 140 }}
            />
          )}
        </View>

        <View style={styles.navContainer}>
          <StudentBottomNav
            navigation={navigation}
            role={role as 'student' | 'lecturer' | 'admin'}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default StudentsReports;

// --- 6. UPDATED STYLES ---
const styles = StyleSheet.create({
  background: { flex: 1 },
  mainContainer: { flex: 1, paddingTop: 60 },
  contentWrapper: { flex: 1, paddingHorizontal: 20 },
  navContainer: { position: 'absolute', bottom: 0, width: '100%' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#064f62',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#064f62',
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#064f62',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  // New styles for Module/Lesson
  moduleCode: { fontSize: 16, fontWeight: 'bold', color: '#064f62' },
  lessonID: { fontSize: 14, color: '#555' },
  clockTime: { fontSize: 14, color: '#555', paddingTop: 5, fontStyle: 'italic' },
  // ---
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  noData: { fontSize: 16, color: '#aaa', textAlign: 'center', marginTop: 20 },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064f62',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  downloadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
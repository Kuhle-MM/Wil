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

type AttendanceRecord = {
  rowKey: string;
  clockInTime: string;
  studentNumber: string;
  status: 'Present' | 'Absent' | string;
};

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

        const url = `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api/StudentClocking/report/${studentNumber}`;
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
      const recDate = new Date(rec.clockInTime);
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
            new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime()
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

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.clockTime}>{formatDateTime(item.clockInTime)}</Text>
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

  const renderSectionHeader = ({ section: { title } }: { section: SectionData }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  // method to export this reports screen into a CSV
  const exportToCSV = async () => {
    try {
      if (sections.length === 0) return Alert.alert('No Attendances', 'No attendance records to export.');

      // Android permission for storage
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to save the report.',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return Alert.alert('Permission Denied', 'Storage permission is required.');
        }
      }

      // Flatten sections into one array
      const allRecords = sections.flatMap((sec) =>
        sec.data.map((item) => ({
          Date: formatDateTime(item.clockInTime),
          StudentNumber: item.studentNumber,
          Status: item.status,
          Group: sec.title,
        }))
      );

      // Converting to CSV string
      const header = 'Date,Student Number,Status,Group\n';
      const csv = header + allRecords.map(r => `${r.Date},${r.StudentNumber},${r.Status},${r.Group}`).join('\n');

      // Defining the file path
      const path = `${RNFS.DownloadDirectoryPath}/attendance_report.csv`;

      // Writing file
      await RNFS.writeFile(path, csv, 'utf8');
      Alert.alert('Success', `Report saved to ${path}`);

      // Optional for user to share the file
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
  clockTime: { fontSize: 16, fontWeight: '600', color: '#064f62' },
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

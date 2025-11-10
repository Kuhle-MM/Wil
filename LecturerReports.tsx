import React, { useEffect, useState } from 'react';
import { RootTabParamList } from './types';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import LecturerBottomNav from "./BottomNav.tsx";

type Report = {
  reportID: string;
  lessonID: string;
  moduleCode: string;
  studentNumber: string;
  status: string;
  rowKey: string;
  timestamp: string;
};
type AuthRouteProp = RouteProp<RootTabParamList, "Auth">;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const LecturerReports: React.FC = () => {
  const [reportData, setReportData] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReportID, setSelectedReportID] = useState<string>('');
  const [reports, setReports] = useState<Report[]>([]);
  const statusOptions = ['Present', 'Absent', 'Late', 'Excused'];

  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params ?? { role: "lecturer" };

  const fetchReport = async (reportID: string) => {
    if (!reportID.trim()) {
      setReportData([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/display_report?ReportID=${reportID}`
      );
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setReportData(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch report.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (report: Report, newStatus: string) => {
    try {
      const response = await fetch(
        `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/update_report_status?reportID=${report.reportID}&studentNumber=${report.studentNumber}&newStatus=${newStatus}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error(await response.text());
      setReportData((prev) =>
        prev.map((r) =>
          r.reportID === report.reportID && r.studentNumber === report.studentNumber
            ? { ...r, status: newStatus }
            : r
        )
      );
      Alert.alert(`${report.studentNumber}'s status has been updated to "${newStatus}".`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status.');
    }
  };

  const exportToExcel = async () => {
    if (reportData.length === 0) {
      Alert.alert('No Data', 'There is no report data to export.');
      return;
    }

    try {
      const formattedData = reportData.map((item) => ({
        LessonID: item.lessonID,
        Module: item.moduleCode,
        Student: item.studentNumber,
        Status: item.status,
        Timestamp: item.timestamp,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const filePath = `${RNFS.DownloadDirectoryPath}/LecturerReport_${selectedReportID || 'All'}.xlsx`;

      await RNFS.writeFile(filePath, wbout, 'base64');
      Alert.alert('Success', `Spreadsheet saved to: ${filePath}`);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to export spreadsheet: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchAllReports = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/all_reports'
        );
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        setReports(data);
      } catch (error) {
        Alert.alert('Error', (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []);

  return (
    <ImageBackground
      source={require('./assets/images/BackgroundImage.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.mainContainer}>
        <View style={styles.content}>
          <Text style={styles.header}>📘 View Lesson Report</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedReportID}
              onValueChange={(itemValue) => {
                setSelectedReportID(itemValue);
                fetchReport(itemValue);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select a Report" value="" />
              {reports.map((report) => (
                <Picker.Item
                  key={report.reportID}
                  label={`Lesson: ${report.lessonID}`}
                  value={report.reportID}
                />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.downloadButton} onPress={exportToExcel}>
            <Text style={styles.downloadButtonText}>Download Report</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#A4C984" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={reportData}
              keyExtractor={(item) => item.rowKey}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Lesson ID: {item.lessonID}</Text>
                  <Text style={styles.cardText}>Module: {item.moduleCode}</Text>
                  <Text style={styles.cardText}>Student: {item.studentNumber}</Text>
                  <Text style={styles.cardText}>Time: {item.timestamp}</Text>

                  <View style={styles.statusRow}>
                    <Text style={styles.cardText}>Status:</Text>
                    <View style={styles.statusPickerWrapper}>
                      <Picker
                        selectedValue={item.status}
                        onValueChange={(value) => updateStatus(item, value)}
                        style={styles.statusPicker}
                      >
                        {statusOptions.map((status) => (
                          <Picker.Item key={status} label={status} value={status} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No reports available. Please select a report.
                </Text>
              }
            />
          )}
        </View>

        <View style={styles.navContainer}>
          <LecturerBottomNav
            navigation={navigation}
            role={role as "student" | "lecturer" | "admin"}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default LecturerReports;

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  mainContainer: { flex: 1, justifyContent: 'space-between' },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: '#A4C984',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
    elevation: 3,
  },
  picker: { height: 50, width: '100%', color: '#333', fontWeight: 'bold', fontSize: 18 },
  downloadButton: {
    backgroundColor: '#064f62',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#e4e4e1',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    alignSelf: 'center',
    width: 320,
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: '#333' },
  cardText: { fontSize: 16, color: '#444', marginBottom: 2 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  statusPickerWrapper: {
    backgroundColor: '#A4C984',
    borderRadius: 8,
    width: 160,
    height: 50,
    justifyContent: 'center',
  },
  statusPicker: { height: 50, color: '#fff', justifyContent: 'center' },
  emptyText: { marginTop: 20, textAlign: 'center', color: '#555' },
  navContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

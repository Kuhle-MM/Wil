import React, { useEffect, useState } from 'react';
import { RootTabParamList } from './types';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Alert, FlatList, ActivityIndicator, TouchableOpacity, ImageBackground, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LecturerBottomNav from './BottomNav.tsx';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

type Report = {
  reportID: string;
  lessonID: string;
  moduleCode: string;
  studentNumber: string;
  status: string;
  rowKey: string;
  timestamp: string;
};

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
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
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
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
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

  useEffect(() => {
    const fetchAllReports = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/all_reports'
        );
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }
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
      <View style={styles.container}>
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
          <Picker.Item label="Select a Report" value=""/>
          {reports.map((report) => (
            <Picker.Item
              key={report.reportID}
              label={`Lesson: ${report.lessonID}`}
              value={report.reportID}
            />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#B8EBD8" style={{ marginTop: 20 }} />
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
            <Text style={styles.emptyText}>No reports available. Please select a report.</Text>
          }
        />
      )}
    </View>
    <LecturerBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </ImageBackground>
    
    
  );
};

export default LecturerReports;

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%', backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    backgroundColor: '#ffffffff', // White background
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
    backgroundColor: '#A4C984', // Grey Buttons
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  pickerLesson: {
    fontWeight: 'bold',
    fontSize: 20
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
    fontWeight: 'bold',
    fontSize: 20
  },
  card: {
    backgroundColor: '#e4e4e1ff', // Powder Blue card
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  statusPickerWrapper: {
  backgroundColor: '#A4C984', // Button color
  borderRadius: 8,
  width: 160,
  height: 50, 
  justifyContent: 'center',
  
},
statusPicker: {
  height: 50, // match wrapper height
  fontSize: 18, // readable size
  lineHeight: 20, // prevents text clipping
  color: '#fff', // white text for contrast
  justifyContent: 'center'
},
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#ffffffff',
  },
});

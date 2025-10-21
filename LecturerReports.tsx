import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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

  // Function to update report status
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
    <View style={styles.container}>
      <Text style={styles.header}>View Lesson Report</Text>

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
            label={`${report.lessonID}`}
            value={report.reportID}
          />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={reportData}
          keyExtractor={(item) => item.rowKey}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>Lesson ID: {item.lessonID}</Text>
              <Text style={styles.cardText}>Module: {item.moduleCode}</Text>
              <Text style={styles.cardText}>Student: {item.studentNumber}</Text>
              <Text style={styles.cardText}>TimeStamp: {item.timestamp}</Text>

              <View style={styles.statusRow}>
                <Text style={styles.cardText}>Status:</Text>
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
          )}
          ListEmptyComponent={<Text style={{ marginTop: 20 }}>No data found.</Text>}
        />
      )}
    </View>
  );
};

export default LecturerReports;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
  },
  cardText: {
    fontSize: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusPicker: {
    height: 60,
    fontSize: 10,
    width: 150,
    marginLeft: 8,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Report = {
  lessonID: string;
  moduleCode: string;
  studentNumber: string;
  rowKey: string;    // For the FlatList keyExtractor
  timestamp: string;
  }

const LecturerReports: React.FC = () => {
  const [lecturerID, setLecturerID] = useState<string>('');
  const [reportID, setReportID] = useState('');
  const [reportData, setReportData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  const fetchReport = async () => {
    if (!reportID.trim()) {
      Alert.alert('Error', 'Please enter a Report ID.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/display_report?ReportID=${reportID}`);

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>View Lesson Report</Text>
      <Picker selectedValue={selectedOption} onValueChange={(itemValue) => {
          setSelectedOption(itemValue); }} style={styles.picker} >
        <Picker.Item label="Select Lesson" value="" />
        <Picker.Item label="MAPC5112-LES-0" value="MAPC5112-LES-0" />
        <Picker.Item label="MAPC5112-LES-1" value="MAPC5112-LES-1" />
        <Picker.Item label="PROG7311-LES-0" value="PROG7311-LES-0" />
        <Picker.Item label="PROG7311-LES-1" value="PROG7311-LES-1" />
      </Picker>

      <Button title="Fetch Report" onPress={fetchReport} />
      {loading ? (
        <Text style={{ marginTop: 20 }}>Loading...</Text>
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
    width: '100%' 
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
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
});
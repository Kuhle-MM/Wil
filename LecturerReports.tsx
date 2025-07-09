import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';

type AttendanceRecord = {
  rowKey: string;
  clockInTime: string;
  studentNumber: string;
  status: string;
};
const StudentsReports: React.FC = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchReport = async () => {
      
      try {
        const url = `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api/StudentClocking/report/getAll`;
        console.log('Requesting attendance from:', url);
        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/api/StudentClocking/report/getAll`
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to fetch attendance report.');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.reportRow}>
        <Text>{item.studentNumber}</Text>
      <Text> {item.clockInTime}</Text>
      <Text>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.scrollContainer}>
      <Text style={styles.header}>Report</Text>
      <Text style={styles.subHeader}>MONTH ▼</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000000" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.rowKey}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default StudentsReports;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 8,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

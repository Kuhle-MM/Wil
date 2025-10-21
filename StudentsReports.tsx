import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import StudentBottomNav from './BottomNav.tsx';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

type AttendanceRecord = {
  rowKey: string;
  clockInTime: string;
  studentNumber: string;
  status: string;
};

const StudentsReports: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;

  const [data, setData] = useState<AttendanceRecord[]>([]);
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
      <Text>{item.clockInTime}</Text>
      <Text>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
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

      <StudentBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </View>
  );
};

export default StudentsReports;

const styles = StyleSheet.create({
  container: {
  flex: 1,             
  backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,              
    padding: 16,
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

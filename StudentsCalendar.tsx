import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StudentBottomNav from './BottomNav.tsx';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

type Lesson = {
  lessonID: string;
  moduleCode: string;
  courseCode: string;
  date: string; // ISO string
};

const StudentsCalendar: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;
  const [studentName, setStudentName] = useState<string>('');
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

      } catch (error) {
        console.error('Error fetching student details', error);
      }
    };

    fetchStudentDetails();
  }, []);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/student_timetable/${studentName}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch timetable");
        }
        const data = await response.json();
        setLessons(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const renderLesson = ({ item }: { item: Lesson }) => {
    const lessonDate = new Date(item.date);
    const dateStr = lessonDate.toLocaleDateString();
    const timeStr = lessonDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.lessonCard}>
        <Text style={styles.lessonDate}>{dateStr} - {timeStr}</Text>
        <Text style={styles.lessonText}>Module: {item.moduleCode}</Text>
        <Text style={styles.lessonText}>Course: {item.courseCode}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.scrollContainer}>
        <Text style={styles.header}>📅 {studentName} Timetable</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : lessons.length === 0 ? (
          <Text>No lessons found.</Text>
        ) : (
          <FlatList
            data={lessons}
            keyExtractor={(item) => item.lessonID}
            renderItem={renderLesson}
          />
        )}

        <TouchableOpacity style={styles.smallButton}>
          <Text>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton}>
          <Text>Discard Changes</Text>
        </TouchableOpacity>
      </View>

      <StudentBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </View>
  );
};

export default StudentsCalendar;

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
    marginBottom: 16,
  },
  lessonCard: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 12,
  },
  lessonDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonText: {
    fontSize: 14,
  },
  smallButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
    alignItems: 'center',
  },
});
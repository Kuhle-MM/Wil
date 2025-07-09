import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

type Lessons = {
  rowKey: string;
  lessonID: string;
  moduleCode: string;
};

const LessonActivity: React.FC = () => {
  const [lecturerID, setLecturerID] = useState<string>('');
  const [selectedLessonID, setSelectedLessonID] = useState('');
  const [lessonStarted, setLessonStarted] = useState(false);
  const [lessons, setLessons] = useState<Lessons[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLecturerIDAndLessons = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (!session) throw new Error('No user session found');
        const parsed = JSON.parse(session);
        if (!parsed.lecturerID) throw new Error('Lecturer ID not found');
        setLecturerID(parsed.lecturerID);

        const response = await fetch(`https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/all_lecturer_lessons?lecturerID=${parsed.lecturerID}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();
        setLessons(data);
      } catch (error) {
        Alert.alert('Error', (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadLecturerIDAndLessons();
  }, []);

  const startLesson = async (lessonID: string) => {
    try {
      const response = await fetch(`https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/startLesson/${lessonID}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.text();
        Alert.alert('Error', errorData);
        return;
      }

      const result = await response.json();
      Alert.alert('Success', result.message);
    } catch (error) {
      Alert.alert('Error', 'Failed to start lesson. Please try again.');
    }
  };

  const endLesson = async (lessonID: string) => {
    try {
      const response = await fetch(`https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/endLesson/${lessonID}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.text();
        Alert.alert('Error', errorData);
        return;
      }

      const result = await response.json();
      Alert.alert('Success', result.message);
    } catch (error) {
      Alert.alert('Error', 'Failed to end lesson. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Lesson</Text>

      <Picker
        selectedValue={selectedLessonID}
        onValueChange={(itemValue) => setSelectedLessonID(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a Lesson" value="" />
        {lessons.map((lesson) => (
          <Picker.Item
            key={lesson.lessonID}
            label={`${lesson.lessonID} (${lesson.moduleCode})`}
            value={lesson.lessonID}
          />
        ))}
      </Picker>

      <Button
        title={lessonStarted ? 'End Lesson' : 'Begin Lesson'}
        onPress={() => {
          if (!selectedLessonID) {
            Alert.alert('Error', 'Please select a lesson first.');
            return;
          }

          if (!lessonStarted) {
            startLesson(selectedLessonID);
            setLessonStarted(true);
          } else {
            endLesson(selectedLessonID);
            setLessonStarted(false);
          }
        }}
      />
    </View>
  );
};

export default LessonActivity;


const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  picker: { height: 50, width: '100%' },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 18,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    marginVertical: 8,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ccc',
    padding: 12,
    width: 200,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  roleButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  roleSelected: {
    backgroundColor: '#cce5ff',
    borderColor: '#007bff',
  },
});
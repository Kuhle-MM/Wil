import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

type Lessons = {
  rowKey: string;
  lessonID: string;
  moduleCode: string;
  started?: boolean;
};

const LessonActivity: React.FC = () => {
  const [studentNumber, setStudentNumber] = useState<string>('');
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
        if (!parsed.studentNumber) throw new Error('Lecturer ID not found');
        setStudentNumber(parsed.studentNumber);

        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/all_lecturer_lessons?lecturerID=${parsed.studentNumber}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();

        // Add local 'started' property if not already present
        const lessonsWithStatus = data.map((lesson: Lessons) => ({
          ...lesson,
          started: lesson.started ?? false,
        }));

        setLessons(lessonsWithStatus);
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
      const response = await fetch(
        `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/startLesson/${lessonID}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorData = await response.text();
        Alert.alert('Error', errorData);
        return;
      }

      const result = await response.json();
      Alert.alert('Success', result.message);

      setLessons(prev =>
        prev.map(l =>
          l.lessonID === lessonID ? { ...l, started: true } : l
        )
      );
      setLessonStarted(true);
    } catch {
      Alert.alert('Error', 'Failed to start lesson. Please try again.');
    }
  };

  const endLesson = async (lessonID: string) => {
    try {
      const response = await fetch(
        `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/endLesson/${lessonID}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorData = await response.text();
        Alert.alert('Error', errorData);
        return;
      }

      const result = await response.json();
      Alert.alert('Success', result.message);

      setLessons(prev =>
        prev.map(l =>
          l.lessonID === lessonID ? { ...l, started: false } : l
        )
      );
      setLessonStarted(false);
    } catch {
      Alert.alert('Error', 'Failed to end lesson. Please try again.');
    }
  };

  const onLessonSelect = (lessonID: string) => {
    setSelectedLessonID(lessonID);
    const lesson = lessons.find(l => l.lessonID === lessonID);
    setLessonStarted(lesson?.started ?? false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Lesson</Text>

      <Picker
        selectedValue={selectedLessonID}
        onValueChange={onLessonSelect}
        style={styles.picker}
      >
        <Picker.Item label="Select a Lesson" value="" />
        {lessons.map(lesson => (
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

          if (!lessonStarted) startLesson(selectedLessonID);
          else endLesson(selectedLessonID);
        }}
      />
    </View>
  );
};

export default LessonActivity;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  picker: { height: 50, width: '100%' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

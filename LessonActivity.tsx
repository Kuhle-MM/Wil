import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootTabParamList } from "./types";
import LecturerBottomNav from "./BottomNav.tsx";

type AuthRouteProp = RouteProp<RootTabParamList, "Auth">;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

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
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params ?? { role: "lecturer" }; // fallback

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
        prev.map(l => (l.lessonID === lessonID ? { ...l, started: true } : l))
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
        prev.map(l => (l.lessonID === lessonID ? { ...l, started: false } : l))
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6bbfe4ff" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('./assets/images/background_2.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.header}>Lesson Manager</Text>

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

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: lessonStarted ? '#f44336' : '#6bbfe4ff' },
            ]}
            onPress={() => {
              if (!selectedLessonID) {
                Alert.alert('Error', 'Please select a lesson first.');
                return;
              }
              if (!lessonStarted) startLesson(selectedLessonID);
              else endLesson(selectedLessonID);
            }}
          >
            <Text style={styles.buttonText}>
              {lessonStarted ? 'End Lesson' : 'Begin Lesson'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <LecturerBottomNav
        navigation={navigation}
        role={role as "student" | "lecturer" | "admin"}
      />
    </ImageBackground>
  );
};

export default LessonActivity;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,// semi-transparent midnight green
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white', 
    borderRadius: 16,
    padding: 20,
    width: 320, // fixed width
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#064f62ff', // midnight green
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#a4c984ff', // pistachio
    borderRadius: 12,
    marginBottom: 25,
    color: '#064f62ff',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f0f0ff',
  },
});

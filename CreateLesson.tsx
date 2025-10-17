import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

type Module = {
  moduleCode: string;
  courseCode: string;
};

const CreateLesson: React.FC = () => {
  const [studentNumber, setStudentNumber] = useState<string>('');
  const [moduleCode, setModuleCode] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [date, setDate] = useState(''); // final ISO string for API
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>(''); 
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  const lessonTimes = ['08:20', '09:20', '10:20', '12:00', '13:00', '14:00', '15:00'];

  const handleCreateLesson = async () => {
    if (!studentNumber || !moduleCode || !courseCode || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    // Combine date and selected time into ISO string
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const combinedDate = new Date(selectedDate);
    combinedDate.setHours(hours);
    combinedDate.setMinutes(minutes);
    combinedDate.setSeconds(0);
    setDate(combinedDate.toISOString());

    try {
      const response = await fetch(
        'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/create_lesson',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lecturerID: studentNumber,
            moduleCode,
            courseCode,
            date: combinedDate.toISOString(),
          }),
        }
      );

      const result = await response.text();

      if (response.ok) {
        Alert.alert('Success', result);
        setModuleCode('');
        setCourseCode('');
        setSelectedDate(null);
        setSelectedTime('');
      } else {
        Alert.alert('Error', result);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to the API.');
    }
  };

  const handleDateChange = (event: any, datePicked?: Date) => {
    setShowDatePicker(false);
    if (datePicked) setSelectedDate(datePicked);
  };

  useEffect(() => {
    const loadLecturerID = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (!session) throw new Error('No user session found');
        const parsed = JSON.parse(session);
        if (!parsed.studentNumber) throw new Error('Lecturer ID not found');
        setStudentNumber(parsed.studentNumber);
      } catch (error) {
        Alert.alert('Error', (error as Error).message);
      }
    };
    loadLecturerID();
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        if (!studentNumber) return;
        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/all_lecturer_modules?lecturerID=${studentNumber}`
        );
        if (!response.ok) throw new Error('Failed to fetch modules');
        const data = await response.json();
        setModules(data);
      } catch (error) {
        Alert.alert('Error', (error as Error).message);
      }
    };
    fetchModules();
  }, [studentNumber]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Lesson</Text>

      {/* Module Picker */}
      <Picker
        selectedValue={moduleCode}
        onValueChange={(value) => setModuleCode(value)}
        style={styles.input}
      >
        <Picker.Item label="Select a module" value="" />
        {modules.map((mod) => (
          <Picker.Item key={mod.moduleCode} label={mod.moduleCode} value={mod.moduleCode} />
        ))}
      </Picker>

      {/* Course Picker */}
      <Picker
        selectedValue={courseCode}
        onValueChange={(value) => setCourseCode(value)}
        style={styles.input}
      >
        <Picker.Item label="Select Course Code" value="" />
        <Picker.Item label="BCAD0701" value="BCAD0701" />
      </Picker>

      {/* Date Picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text>{selectedDate ? selectedDate.toDateString() : 'Select Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker */}
      <Picker
        selectedValue={selectedTime}
        onValueChange={(value) => setSelectedTime(value)}
        style={styles.input}
      >
        <Picker.Item label="Select Time" value="" />
        {lessonTimes.map((time) => (
          <Picker.Item key={time} label={time} value={time} />
        ))}
      </Picker>

      <Button title="Create Lesson" onPress={handleCreateLesson} />
    </View>
  );
};

export default CreateLesson;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
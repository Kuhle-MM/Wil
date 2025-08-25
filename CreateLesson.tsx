import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

type Module = {
  moduleCode: string;
  courseCode: string;
};

const CreateLesson: React.FC = () => {
  const [lecturerID, setLecturerID] = useState<string>('');
  const [moduleCode, setModuleCode] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [date, setDate] = useState(''); // final ISO string for API
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  const handleCreateLesson = async () => {
    if (!lecturerID || !moduleCode || !courseCode || !date) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      const response = await fetch(
        'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/create_lesson',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lecturerID,
            moduleCode,
            courseCode : courseCode,
            date,
          }),
        }
      );

      const result = await response.text();

      if (response.ok) {
        Alert.alert('Success', result);
        setModuleCode('');
        setCourseCode('');
        setDate('');
        setSelectedDate(null);
        setSelectedTime(null);
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
    if (datePicked) {
      setSelectedDate(datePicked);
      if (selectedTime) {
        combineDateAndTime(datePicked, selectedTime);
      }
    }
  };

  const handleTimeChange = (event: any, timePicked?: Date) => {
    setShowTimePicker(false);
    if (timePicked) {
      setSelectedTime(timePicked);
      if (selectedDate) {
        combineDateAndTime(selectedDate, timePicked);
      }
    }
  };

  const combineDateAndTime = (datePart: Date, timePart: Date) => {
    const combined = new Date(datePart);
    combined.setHours(timePart.getHours());
    combined.setMinutes(timePart.getMinutes());
    combined.setSeconds(0);
    setDate(combined.toISOString()); // set final ISO string
  };

  useEffect(() => {
    const loadLecturerID = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (!session) throw new Error('No user session found');
        const parsed = JSON.parse(session);
        if (!parsed.lecturerID) throw new Error('Lecturer ID not found');
        setLecturerID(parsed.lecturerID);
      } catch (error) {
        Alert.alert('Error', (error as Error).message);
      }
    };

    loadLecturerID();
  }, []);

  useEffect(() => {
  const fetchModules = async () => {
    try {
      if (!lecturerID) return;

      const response = await fetch(
        `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/all_lecturer_modules?lecturerID=${lecturerID}`
      );
      if (!response.ok) throw new Error('Failed to fetch modules');

      const data = await response.json();
      setModules(data); // Assuming each item has moduleCode and courseCode
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  fetchModules();
}, [lecturerID]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Lesson</Text>

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
      <Picker
              selectedValue={courseCode}
              onValueChange={(itemValue) => setCourseCode(itemValue)}
              style={styles.picker}
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
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
        <Text>{selectedTime ? selectedTime.toLocaleTimeString() : 'Select Time'}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Button title="Create Lesson" onPress={handleCreateLesson} />
    </View>
  );
};

export default CreateLesson;


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
  picker: { 
    height: 50, 
    width: '100%' 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
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
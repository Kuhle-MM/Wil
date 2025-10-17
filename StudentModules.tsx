import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StudentBottomNav from './BottomNav.tsx';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

type Module = {
  RowKey: string;
  code: string;
  moduleName: string;
};

const StudentModules: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;

  const [studentNumber, setStudentNumber] = useState<string>('');
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [assignedModules, setAssignedModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [loadingModules, setLoadingModules] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  // Load Student Number from AsyncStorage
  useEffect(() => {
    const loadStudentNumber = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (!session) throw new Error('No user session found');
        const parsed = JSON.parse(session);
        if (!parsed.studentNumber) throw new Error('Student Number not found');
        setStudentNumber(parsed.studentNumber);
      } catch (error) {
        Alert.alert('Error', (error as Error).message);
        setLoadingModules(false);
        setLoadingAssigned(false);
      }
    };
    loadStudentNumber();
  }, []);

  // Fetch all modules (to match moduleCode with moduleName)
  useEffect(() => {
    const fetchAllModules = async () => {
      try {
        const response = await fetch(
          'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/all_modules'
        );
        if (!response.ok) throw new Error('Failed to fetch all modules');
        const data: Module[] = await response.json();
        setAllModules(data);
      } catch (error) {
        Alert.alert('Error', 'Could not load all modules.');
        console.error(error);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchAllModules();
  }, []);

  // Fetch assigned modules when studentNumber is ready
  useEffect(() => {
    if (!studentNumber) return;

    const fetchAssignedModules = async () => {
      try {
        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/all_student_modules?studentNumber=${studentNumber.toUpperCase()}`
        );
        if (!response.ok) throw new Error('Failed to fetch assigned modules');
        const data = await response.json();

        // Transform to match the UI model
        const transformedModules: Module[] = data.map((item: any) => ({
          RowKey: item.rowKey,
          code: item.moduleCode,
          moduleName:
            allModules.find((m) => m.code === item.moduleCode)?.moduleName ||
            'N/A',
        }));

        setAssignedModules(transformedModules);
      } catch (error) {
        Alert.alert('Error', 'Could not load your assigned modules.');
        console.error(error);
      } finally {
        setLoadingAssigned(false);
      }
    };

    fetchAssignedModules();
  }, [studentNumber, allModules]);

  const AddModule = async () => {
    if (!selectedModule) {
      Alert.alert('Please select a module to add');
      return;
    }

    try {
      const payload = { studentNumber, moduleCode: selectedModule };
      const response = await fetch(
        'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/student_add_module',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const resultText = await response.text();
      if (!response.ok) {
        Alert.alert('Failed', resultText);
        return;
      }
      Alert.alert('Success', resultText);

      // Refresh list
      setLoadingAssigned(true);
      const updatedResponse = await fetch(
        `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/all_student_modules?studentNumber=${studentNumber.toUpperCase()}`
      );
      const updatedData = await updatedResponse.json();
      const transformed = updatedData.map((item: any) => ({
        RowKey: item.rowKey,
        code: item.moduleCode,
        moduleName:
          allModules.find((m) => m.code === item.moduleCode)?.moduleName ||
          'N/A',
      }));
      setAssignedModules(transformed);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to the server.');
    } finally {
      setLoadingAssigned(false);
    }
  };

  const renderModule = ({ item }: { item: Module }) => (
    <View style={styles.reportRow}>
      <Text style={styles.cell}>{item.code}</Text>
      <Text style={styles.cell}>{item.moduleName}</Text>
    </View>
  );

  if (loadingModules || loadingAssigned) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scrollContainer}>
        <Text style={styles.header}>Assigned Modules</Text>
        {assignedModules.length === 0 ? (
          <Text>No modules assigned to you yet.</Text>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.headerCell]}>Module Code</Text>
              <Text style={[styles.cell, styles.headerCell]}>Module Name</Text>
            </View>
            <FlatList
              data={assignedModules}
              keyExtractor={(item) => item.RowKey}
              renderItem={renderModule}
            />
          </>
        )}

      <Text style={[styles.header, { marginTop: 20 }]}>Add Module</Text>
      {(() => {
        const availableModules = allModules.filter(
          (mod) => !assignedModules.some((assigned) => assigned.code === mod.code)
        );

        const placeholderLabel =
          availableModules.length === 0
            ? "No more modules to choose from"
            : "Select a Module";

        return (
          <>
            <Picker
              selectedValue={selectedModule}
              onValueChange={(itemValue) => setSelectedModule(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label={placeholderLabel} value="" />
              {availableModules.map((mod) => (
                <Picker.Item
                  label={`${mod.code} - ${mod.moduleName}`}
                  value={mod.code}
                  key={mod.RowKey}
                />
              ))}
            </Picker>

            <TouchableOpacity
              style={[
                styles.button,
                { opacity: availableModules.length === 0 ? 0.5 : 1 },
              ]}
              onPress={AddModule}
              disabled={availableModules.length === 0}
            >
              <Text style={styles.buttonText}>Add Module</Text>
            </TouchableOpacity>
          </>
        );
      })()}

      </View>
      <StudentBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </View>
  );
};

export default StudentModules;

const styles = StyleSheet.create({
  container: {
  flex: 1,             
  backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,              
    padding: 16,
  },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 8,
    marginBottom: 8,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: { flex: 1, fontSize: 16 },
  headerCell: { fontWeight: 'bold' },
  picker: { height: 50, width: '100%' },
  button: {
    backgroundColor: '#4287f5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
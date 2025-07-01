import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthRouteProp = RouteProp<RootTabParamList, 'LecturerModules'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

type Module = {
  RowKey: string;
  code: string;
  moduleName: string;
};


const LecturerModules: React.FC = () => {
    const navigation = useNavigation<AuthNavProp>();
    const route = useRoute<AuthRouteProp>();
    const role = route.params?.role ?? 'lecturer';
    
    const [lecturerID, setID] = useState('');
    const [moduleCode, setModuleCode] = useState('');

    const [selectedModule, setSelectedModule] = useState('');
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);

   useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/all_modules');
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        const data: Module[] = await response.json();
        setModules(data);
      } catch (error) {
        Alert.alert('Error', 'Could not load modules.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  useEffect(() => {
    const LecturerModules = async () => {
      try {
      // Load lecturerID from AsyncStorage first
      const session = await AsyncStorage.getItem('userSession');
      if (!session) {
        throw new Error('No user session found');
      }

      const parsed = JSON.parse(session);
      const lecturerIDFromSession = parsed.lecturerID;

      if (!lecturerIDFromSession) {
        throw new Error('Lecturer ID not found in session');
      }

      setID(lecturerIDFromSession);

      // Call your API with lecturerID as query parameter
      const response = await fetch(
        `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/all_lecturer_modules?lecturerID=${lecturerID}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch modules for lecturer');
      }

      const data: Module[] = await response.json();
      setModules(data);
    } catch (error) {
      console.error('Error loading lecturer modules:', error);
      Alert.alert('Error', 'Could not load your modules.');
    } finally {
      setLoading(false);
    }
  };

  LecturerModules();
}, []);

  useEffect(() => {
  const loadLecturerID = async () => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (session) {
        const parsed = JSON.parse(session);
        setID(parsed.lecturerID); 
      }
    } catch (error) {
      console.error('Error loading lecturer ID:', error);
    }
  };

  loadLecturerID();
}, []);
  
const AddModules = async () => {
    const endpoint = 'https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Module/lecturer_add_module';

    try {
    const payload = {
        lecturerID,
        moduleCode : selectedModule
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const resultText = await response.text();

    if (!response.ok) {
        Alert.alert('Failed', resultText);
        return;
    }

    Alert.alert('Success', resultText);
    navigation.navigate('LecturerModules', { role });

    } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Could not connect to the server.');
    }

};

  const renderItem = ({ item }: { item: Module }) => (
      <View style={styles.reportRow}>
          <Text>{item.code}</Text>
        <Text> {item.moduleName}</Text>
      </View>
    );

  return (
  <ScrollView style={styles.container}>
    <Text style={styles.header}>Modules</Text>

    <View style={styles.tableHeader}>
      <Text style={[styles.cell, styles.headerCell]}>Module Code</Text>
      <Text style={[styles.cell, styles.headerCell]}>Module Name</Text>
    </View>

    {loading ? (
      <ActivityIndicator size="large" color="#000" />
    ) : (
      <FlatList
        data={modules}
        keyExtractor={(item) => item.RowKey}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No modules found.</Text>}
      />
    )}

    <Picker
        selectedValue={selectedModule}
        onValueChange={(itemValue) => {
            setSelectedModule(itemValue);
            setModuleCode(itemValue); 
        }}
        style={styles.picker}
        >
        <Picker.Item label="MAPC5112 - Test Module" value="MAPC5112" />

        {modules.map((module, index) => (
            <Picker.Item
            label={`${module.code} - ${module.moduleName}`}
            value={module.code}
            key={index}
            />
        ))}
        </Picker>
    <TouchableOpacity style={styles.button} onPress={AddModules}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
    
  </ScrollView>
  );
};

export default LecturerModules;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  button: {
    backgroundColor: '#4287f5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  label: {
  fontSize: 16,
  marginBottom: 8,
  fontWeight: '500',
},

pickerContainer: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  marginBottom: 16,
},

picker: {
  height: 50,
  width: '100%',
},
reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    fontSize: 16,
  },
  headerCell: {
    fontWeight: 'bold',
  },
});
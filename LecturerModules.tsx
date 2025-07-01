import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import { Picker } from '@react-native-picker/picker';

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
      onValueChange={(itemValue) => setSelectedModule(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="-- Select Module --" value="" />
      {modules.map((module, index) => (
        <Picker.Item
          label={`${module.code} - ${module.moduleName}`}
          value={module.code} 
          key={index}
        />
      ))}
    </Picker>
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
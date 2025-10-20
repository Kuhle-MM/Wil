import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthRouteProp = RouteProp<RootTabParamList, 'Modules'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

type Module = {
  RowKey: string;
  code: string;
  moduleName: string;
};

const Modules: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

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

  const AddModule = () => {
    navigation.navigate('CreateModule', { role }); 
  };

  const renderModule = ({ item }: { item: Module }) => (
    <View style={styles.reportRow}>
      <Text style={styles.cell}>{item.code}</Text>
      <Text style={styles.cell}>{item.moduleName}</Text>
    </View>
  );

  if (loadingModules) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Modules</Text>
      {allModules.length === 0 ? (
        <Text>No modules found.</Text>
      ) : (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerCell]}>Module Code</Text>
            <Text style={[styles.cell, styles.headerCell]}>Module Name</Text>
          </View>
          <FlatList
            data={allModules}
            keyExtractor={(item) => item.RowKey}
            renderItem={renderModule}
          />
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={AddModule}>
        <Text style={styles.buttonText}>Add Module</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Modules;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
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
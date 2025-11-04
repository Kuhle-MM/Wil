import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ImageBackground,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import AdminBottomNav from './BottomNav.tsx';

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
    <View style={styles.moduleCard}>
      <Text style={styles.moduleCode}>{item.code}</Text>
      <Text style={styles.moduleName}>{item.moduleName}</Text>
    </View>
  );

  if (loadingModules) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#064f62" />
        <Text style={styles.loadingText}>Loading modules...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('./assets/images/BackgroundImage.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>📚 All Modules</Text>
          <Text style={styles.headerSubtitle}>Manage and view all registered modules</Text>
        </View>

        {allModules.length === 0 ? (
          <Text style={styles.noDataText}>No modules found.</Text>
        ) : (
          <FlatList
            data={allModules}
            keyExtractor={(item, index) => item.RowKey?.toString() || index.toString()}
            renderItem={renderModule}
            contentContainerStyle={styles.listContainer}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={AddModule}>
          <Text style={styles.addButtonText}>＋ Add Module</Text>
        </TouchableOpacity>
      </View>

      <AdminBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </ImageBackground>
  );
};

export default Modules;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#064f62',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#d8f3dc',
  },
  listContainer: {
    paddingBottom: 20,
  },
  moduleCard: {
    backgroundColor: '#A4C984',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  moduleCode: {
    fontSize: 18,
    color: '#064f62',
    fontWeight: 'bold',
  },
  moduleName: {
    fontSize: 16,
    color: '#2e2e2e',
    marginTop: 4,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#444',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#064f62',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  loadingText: {
    color: '#064f62',
    fontSize: 16,
    marginTop: 8,
  },
});

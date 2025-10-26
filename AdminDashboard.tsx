import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import AdminBottomNav from './BottomNav.tsx';

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;

  const createUser = async () => {
    navigation.navigate('CreateUser', { role });
  };

  const createModule = async () => {
    navigation.navigate('CreateModule', { role });
  };

  const viewModules = async () => {
    navigation.navigate('Modules', { role });
  };

  return (
    <ImageBackground
      source={require('./assets/images/BackgroundImage.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.header}>📙 Your Dashboard</Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.gridButton} onPress={createUser}>
            <Text style={styles.gridTextEmoji}>👤</Text>
            <Text style={styles.gridText}>Create User</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={viewModules}>
            <Text style={styles.gridTextEmoji}>📚</Text>
            <Text style={styles.gridText}>View Modules</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridButton, styles.fullWidthButton]}
            onPress={createModule}
          >
            <Text style={styles.gridTextEmoji}>➕</Text>
            <Text style={styles.gridText}>Create Module</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AdminBottomNav navigation={navigation} role={role as 'student' | 'lecturer' | 'admin'} />
    </ImageBackground>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%', backgroundColor: '#FFFFFF' },
  scrollContainer: { flex: 1, padding: 16 },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2E2E2E',
    marginTop: 60,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 25,
    marginVertical: 8,
    fontWeight: '600',
    color: '#838282ff',
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  gridButton: {
    width: '48%',
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    backgroundColor: '#064f62',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  gridText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  gridTextEmoji: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  fullWidthButton: {
    width: '100%',
    height: 120,
  },
});

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList } from './types';
import LecturerBottomNav from "./BottomNav.tsx";

type AuthRouteProp = RouteProp<RootTabParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const LecturerLessons: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params;

  const handleLesson = async () => {
    navigation.navigate('CreateLesson', { role });
  };

  const handleActivity = async () => {
    navigation.navigate('LessonActivity', { role });
  };

  return (
    <ImageBackground
      source={require('./assets/images/BackgroundImage.jpg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.header}>📋 Lessons</Text>
        <Text style={styles.subHeader}>Manage your lessons easily</Text>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Lesson</Text>
            <TouchableOpacity style={styles.button} onPress={handleLesson}>
              <Text style={styles.buttonText}>Go</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lesson Activity</Text>
            <TouchableOpacity style={styles.button} onPress={handleActivity}>
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <LecturerBottomNav
        navigation={navigation}
        role={role as "student" | "lecturer" | "admin"}
      />
    </ImageBackground>
  );
};

export default LecturerLessons;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f9f0f0ff', // snow fallback if no image
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#064f62ff', // midnight green
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#6bbfe4ff', // sky blue
    marginBottom: 20,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#a4c984ff', // pistachio
    width: 260, // fixed width
    height: 160,
    borderRadius: 20,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#064f62ff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6bbfe4ff', // sky blue
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

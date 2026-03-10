import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const race = useSelector((state: RootState) => state.race);
  const team = useSelector((state: RootState) => state.team);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spartan Team Tracker</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <Text style={styles.statusText}>
          Race: {race.name || 'Not started'}
        </Text>
        <Text style={styles.statusText}>
          Team: {team.name || 'No team'}
        </Text>
        <Text style={styles.statusText}>
          Members: {team.members.length}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Race' as never)}
        >
          <Text style={styles.buttonText}>Start Race</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Team' as never)}
        >
          <Text style={styles.buttonText}>Manage Team</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Analytics' as never)}
        >
          <Text style={styles.buttonText}>View Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#7f8c8d',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setRace, startRace, pauseRace, resumeRace, completeRace, setRaceType } from '@/store/raceSlice';

interface RaceTypeOption {
  value: 'sprint' | 'super' | 'beast' | 'ultra';
  label: string;
  distance: string;
}

const raceTypes: RaceTypeOption[] = [
  { value: 'sprint', label: 'Sprint', distance: '5km' },
  { value: 'super', label: 'Super', distance: '13km' },
  { value: 'beast', label: 'Beast', distance: '21km' },
  { value: 'ultra', label: 'Ultra', distance: '42km' },
];

export const RaceScreen = () => {
  const dispatch = useDispatch();
  const race = useSelector((state: RootState) => state.race);
  const team = useSelector((state: RootState) => state.team);
  const [raceName, setRaceName] = useState('');

  const handleStartRace = () => {
    if (raceName.trim() && team.members.length > 0) {
      dispatch(setRace({
        id: Date.now().toString(),
        name: raceName,
        status: 'active',
        startTime: Date.now(),
      }));
      dispatch(startRace());
    }
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '--:--:--';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getElapsedTime = () => {
    if (!race.startTime) return '00:00:00';
    const elapsed = Date.now() - race.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Race Management</Text>

      {race.status === 'pre-race' && (
        <View style={styles.setupContainer}>
          <Text style={styles.sectionTitle}>Race Setup</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Race Name</Text>
            <Text style={styles.input}>
              {raceName || 'Enter race name...'}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Race Type</Text>
            <View style={styles.raceTypeContainer}>
              {raceTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.raceTypeButton,
                    race.type === type.value && styles.raceTypeButtonActive
                  ]}
                  onPress={() => dispatch(setRaceType(type.value))}
                >
                  <Text style={[
                    styles.raceTypeText,
                    race.type === type.value && styles.raceTypeTextActive
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={styles.raceDistance}>{type.distance}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.startButton,
              (!raceName.trim() || team.members.length === 0) && styles.startButtonDisabled
            ]}
            onPress={handleStartRace}
            disabled={!raceName.trim() || team.members.length === 0}
          >
            <Text style={styles.startButtonText}>
              Start Race
            </Text>
          </TouchableOpacity>

          {team.members.length === 0 && (
            <Text style={styles.warningText}>
              Add team members before starting race
            </Text>
          )}
        </View>
      )}

      {race.status === 'active' && (
        <View style={styles.activeContainer}>
          <Text style={styles.raceName}>{race.name}</Text>
          <Text style={styles.elapsedTime}>{getElapsedTime()}</Text>
          <Text style={styles.distance}>Distance: {(race.distance / 1000).toFixed(1)}km</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => dispatch(pauseRace())}
            >
              <Text style={styles.controlButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.completeButton]}
              onPress={() => dispatch(completeRace())}
            >
              <Text style={styles.controlButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {race.status === 'paused' && (
        <View style={styles.activeContainer}>
          <Text style={styles.raceName}>{race.name} - PAUSED</Text>
          <Text style={styles.elapsedTime}>{getElapsedTime()}</Text>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => dispatch(resumeRace())}
          >
            <Text style={styles.controlButtonText}>Resume Race</Text>
          </TouchableOpacity>
        </View>
      )}

      {race.status === 'completed' && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>Race Completed!</Text>
          <Text style={styles.raceName}>{race.name}</Text>
          <Text style={styles.finalTime}>Final Time: {getElapsedTime()}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  setupContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#34495e',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#7f8c8d',
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  raceTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  raceTypeButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 80,
  },
  raceTypeButtonActive: {
    borderColor: '#e74c3c',
    backgroundColor: '#ffeaea',
  },
  raceTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  raceTypeTextActive: {
    color: '#e74c3c',
  },
  raceDistance: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  startButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  startButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  activeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  raceName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  elapsedTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  distance: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  controlButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#27ae60',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  finalTime: {
    fontSize: 20,
    color: '#2c3e50',
    marginTop: 10,
  },
});
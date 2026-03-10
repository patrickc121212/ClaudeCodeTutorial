import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const AnalyticsScreen = () => {
  const race = useSelector((state: RootState) => state.race);
  const team = useSelector((state: RootState) => state.team);
  const location = useSelector((state: RootState) => state.location);

  const calculatePace = (memberId: string): number => {
    const member = team.members.find(m => m.id === memberId);
    if (!member || !member.lastLocation || race.startTime === null) return 0;

    const timeElapsed = Date.now() - race.startTime;
    if (timeElapsed === 0) return 0;

    // Simple pace calculation (meters per second)
    return member.distanceCovered / (timeElapsed / 1000);
  };

  const formatPace = (pace: number): string => {
    if (pace === 0) return '--:--';
    const minutesPerKm = 1000 / pace / 60;
    const minutes = Math.floor(minutesPerKm);
    const seconds = Math.round((minutesPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProjectedFinishTime = (memberId: string): string => {
    const pace = calculatePace(memberId);
    if (pace === 0 || race.distance === 0) return '--:--:--';

    const remainingDistance = race.distance - (team.members.find(m => m.id === memberId)?.distanceCovered || 0);
    const remainingTime = remainingDistance / pace;
    const projectedFinish = Date.now() + remainingTime * 1000;

    return new Date(projectedFinish).toLocaleTimeString();
  };

  const getElapsedTime = (): string => {
    if (!race.startTime) return '00:00:00';
    const elapsed = Date.now() - race.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Performance Analytics</Text>

      {/* Race Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Race Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getElapsedTime()}</Text>
            <Text style={styles.statLabel}>Time Elapsed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(race.distance / 1000).toFixed(1)}km</Text>
            <Text style={styles.statLabel}>Total Distance</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{team.members.length}</Text>
            <Text style={styles.statLabel}>Team Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{race.obstacles.length}</Text>
            <Text style={styles.statLabel}>Obstacles</Text>
          </View>
        </View>
      </View>

      {/* Team Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Performance</Text>

        {team.members.length === 0 ? (
          <Text style={styles.emptyText}>No team members to track</Text>
        ) : (
          team.members.map((member) => (
            <View key={member.id} style={styles.memberStats}>
              <View style={styles.memberHeader}>
                <Text style={styles.memberName}>{member.name}</Text>
                {team.captainId === member.id && (
                  <Text style={styles.captainBadge}>CAPTAIN</Text>
                )}
              </View>

              <View style={styles.memberMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {(member.distanceCovered / 1000).toFixed(2)}km
                  </Text>
                  <Text style={styles.metricLabel}>Distance Covered</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {formatPace(calculatePace(member.id))}/km
                  </Text>
                  <Text style={styles.metricLabel}>Current Pace</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {getProjectedFinishTime(member.id)}
                  </Text>
                  <Text style={styles.metricLabel}>Projected Finish</Text>
                </View>
              </View>

              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot,
                  member.status === 'active' && styles.statusActive,
                  member.status === 'paused' && styles.statusPaused,
                  member.status === 'completed' && styles.statusCompleted,
                  member.status === 'dropped' && styles.statusDropped,
                ]} />
                <Text style={styles.statusText}>{member.status.toUpperCase()}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* GPS Accuracy */}
      {location.currentLocation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS Accuracy</Text>
          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyValue}>
              {location.currentLocation.accuracy.toFixed(1)}m
            </Text>
            <Text style={styles.accuracyLabel}>Current Accuracy</Text>
            <View style={styles.accuracyBar}>
              <View
                style={[
                  styles.accuracyFill,
                  {
                    width: `${Math.max(0, 100 - (location.currentLocation.accuracy / location.accuracyThreshold) * 100)}%`,
                    backgroundColor: location.currentLocation.accuracy <= location.accuracyThreshold
                      ? '#27ae60'
                      : '#e74c3c'
                  }
                ]}
              />
            </View>
            <Text style={styles.accuracyThreshold}>
              Target: ≤{location.accuracyThreshold}m
            </Text>
          </View>
        </View>
      )}

      {/* Performance Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Tips</Text>
        <View style={styles.tipsContainer}>
          <Text style={styles.tipText}>
            • Maintain consistent pace for better endurance
          </Text>
          <Text style={styles.tipText}>
            • Stay hydrated throughout the race
          </Text>
          <Text style={styles.tipText}>
            • Use obstacles as recovery points
          </Text>
          <Text style={styles.tipText}>
            • Keep team members within visual distance
          </Text>
        </View>
      </View>
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
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#34495e',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#bdc3c7',
    fontStyle: 'italic',
    padding: 20,
  },
  memberStats: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  captainBadge: {
    backgroundColor: '#f39c12',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  memberMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
    backgroundColor: '#bdc3c7',
  },
  statusActive: {
    backgroundColor: '#27ae60',
  },
  statusPaused: {
    backgroundColor: '#f39c12',
  },
  statusCompleted: {
    backgroundColor: '#3498db',
  },
  statusDropped: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  accuracyContainer: {
    alignItems: 'center',
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  accuracyLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  accuracyBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 5,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 4,
  },
  accuracyThreshold: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  tipsContainer: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});
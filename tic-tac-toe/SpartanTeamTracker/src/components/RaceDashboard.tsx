import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { analyticsService } from '@/services/AnalyticsService';

interface RaceDashboardProps {
  showIndividualStats?: boolean;
  showTeamComparison?: boolean;
}

export const RaceDashboard: React.FC<RaceDashboardProps> = ({
  showIndividualStats = true,
  showTeamComparison = true,
}) => {
  const team = useSelector((state: RootState) => state.team);
  const race = useSelector((state: RootState) => state.race);

  const teamAnalytics = analyticsService.getTeamAnalytics();

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatPace = (pace: number): string => {
    if (pace === 0) return '--:--';
    const minutesPerKm = 1000 / pace / 60;
    const minutes = Math.floor(minutesPerKm);
    const seconds = Math.round((minutesPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = (): string => {
    if (!race.startTime) return '00:00:00';
    const elapsed = Date.now() - race.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (race.distance === 0) return 0;
    const averageDistance = team.members.reduce((sum, member) => sum + member.distanceCovered, 0) / team.members.length;
    return Math.min(100, (averageDistance / race.distance) * 100);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Race Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Race Overview</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{getElapsedTime()}</Text>
            <Text style={styles.overviewLabel}>Time Elapsed</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{formatDistance(race.distance)}</Text>
            <Text style={styles.overviewLabel}>Total Distance</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{getProgressPercentage().toFixed(0)}%</Text>
            <Text style={styles.overviewLabel}>Progress</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{race.obstacles.length}</Text>
            <Text style={styles.overviewLabel}>Obstacles</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgressPercentage()}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatDistance((race.distance * getProgressPercentage()) / 100)} / {formatDistance(race.distance)}
          </Text>
        </View>
      </View>

      {/* Team Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Performance</Text>
        <View style={styles.teamStats}>
          <View style={styles.teamStatItem}>
            <Text style={styles.teamStatValue}>{formatPace(teamAnalytics.averagePace)}</Text>
            <Text style={styles.teamStatLabel}>Avg Pace/km</Text>
          </View>
          <View style={styles.teamStatItem}>
            <Text style={styles.teamStatValue}>{teamAnalytics.activeMembers}/{teamAnalytics.totalMembers}</Text>
            <Text style={styles.teamStatLabel}>Active Members</Text>
          </View>
          <View style={styles.teamStatItem}>
            <Text style={styles.teamStatValue}>{formatDistance(teamAnalytics.teamSpread)}</Text>
            <Text style={styles.teamStatLabel}>Team Spread</Text>
          </View>
        </View>

        {/* Fastest/Slowest */}
        {teamAnalytics.fastestMember && teamAnalytics.slowestMember && (
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Fastest:</Text>
              <Text style={styles.comparisonValue}>{teamAnalytics.fastestMember}</Text>
            </View>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Slowest:</Text>
              <Text style={styles.comparisonValue}>{teamAnalytics.slowestMember}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Individual Member Stats */}
      {showIndividualStats && team.members.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member Performance</Text>
          {team.members.map((member) => {
            const metrics = analyticsService.getMemberMetrics(member.id);
            const projection = analyticsService.getRaceProjection(member.id);

            return (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: member.status === 'active' ? '#27ae60' :
                                     member.status === 'paused' ? '#f39c12' :
                                     member.status === 'completed' ? '#3498db' : '#e74c3c'
                    }
                  ]} />
                </View>

                <View style={styles.memberStats}>
                  <View style={styles.memberStat}>
                    <Text style={styles.memberStatValue}>
                      {formatDistance(metrics.distanceCovered)}
                    </Text>
                    <Text style={styles.memberStatLabel}>Distance</Text>
                  </View>
                  <View style={styles.memberStat}>
                    <Text style={styles.memberStatValue}>
                      {metrics.pacePerKm}
                    </Text>
                    <Text style={styles.memberStatLabel}>Pace</Text>
                  </View>
                  <View style={styles.memberStat}>
                    <Text style={styles.memberStatValue}>
                      {metrics.projectedFinishFormatted}
                    </Text>
                    <Text style={styles.memberStatLabel}>Projected Finish</Text>
                  </View>
                </View>

                {/* Performance Trend */}
                <View style={styles.trendContainer}>
                  <Text style={styles.trendLabel}>
                    Performance: {metrics.performanceTrend}
                  </Text>
                  <Text style={styles.confidenceText}>
                    Confidence: {projection.confidence}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Safety Alerts */}
      {teamAnalytics.safetyAlerts.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={styles.alertTitle}>Safety Alerts</Text>
          {teamAnalytics.safetyAlerts.map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <Text style={styles.alertText}>⚠️ {alert}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Race Projections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Race Projections</Text>
        {team.members
          .filter(member => member.status === 'active')
          .map((member) => {
            const projection = analyticsService.getRaceProjection(member.id);

            return (
              <View key={member.id} style={styles.projectionCard}>
                <Text style={styles.projectionName}>{member.name}</Text>
                <View style={styles.projectionStats}>
                  <View style={styles.projectionStat}>
                    <Text style={styles.projectionLabel}>Remaining:</Text>
                    <Text style={styles.projectionValue}>
                      {formatDistance(projection.remainingDistance)}
                    </Text>
                  </View>
                  <View style={styles.projectionStat}>
                    <Text style={styles.projectionLabel}>Finish Time:</Text>
                    <Text style={styles.projectionValue}>
                      {projection.projectedFinishTimeFormatted}
                    </Text>
                  </View>
                  <View style={styles.projectionStat}>
                    <Text style={styles.projectionLabel}>Confidence:</Text>
                    <Text style={styles.projectionValue}>
                      {projection.confidence}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
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
    color: '#2c3e50',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  overviewItem: {
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 10,
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  teamStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  teamStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  teamStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonItem: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  memberCard: {
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
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  memberStat: {
    alignItems: 'center',
    flex: 1,
  },
  memberStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 2,
  },
  memberStatLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  alertSection: {
    backgroundColor: '#ffeaa7',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  alertItem: {
    marginBottom: 5,
  },
  alertText: {
    fontSize: 14,
    color: '#d35400',
  },
  projectionCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  projectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  projectionStats: {
    gap: 8,
  },
  projectionStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectionLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  projectionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

export default RaceDashboard;
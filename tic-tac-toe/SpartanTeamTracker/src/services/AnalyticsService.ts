import { store } from '@/store/store';
import { RootState } from '@/store/store';
import { calculatePace, calculateProjectedFinishTime, formatTime } from '@/utils/PaceCalculator';
import { calculateRaceProjection, analyzePerformance, calculateObstacleImpact } from '@/utils/RaceProjections';

class AnalyticsService {
  private paceHistory: Map<string, number[]> = new Map(); // memberId -> pace history
  private distanceHistory: Map<string, number[]> = new Map(); // memberId -> distance history

  /**
   * Get performance metrics for a team member
   */
  getMemberMetrics(memberId: string): {
    currentPace: number;
    averagePace: number;
    pacePerKm: string;
    distanceCovered: number;
    timeElapsed: number;
    projectedFinish: number;
    projectedFinishFormatted: string;
    caloriesBurned: number;
    paceConsistency: number;
    performanceTrend: string;
  } {
    const state = store.getState();
    const member = state.team.members.find(m => m.id === memberId);
    const race = state.race;

    if (!member || race.startTime === null) {
      return this.getDefaultMetrics();
    }

    const timeElapsed = Date.now() - race.startTime;
    const paceMetrics = calculatePace(member.distanceCovered, timeElapsed);

    // Calculate performance analysis
    const memberPaceHistory = this.paceHistory.get(memberId) || [];
    const memberDistanceHistory = this.distanceHistory.get(memberId) || [];
    const performance = analyzePerformance(memberPaceHistory, memberDistanceHistory, timeElapsed);

    // Estimate calories (assuming average runner weight of 70kg)
    const caloriesBurned = this.estimateCalories(member.distanceCovered, paceMetrics.currentPace);

    return {
      currentPace: paceMetrics.currentPace,
      averagePace: paceMetrics.averagePace,
      pacePerKm: paceMetrics.pacePerKm,
      distanceCovered: member.distanceCovered,
      timeElapsed,
      projectedFinish: paceMetrics.projectedFinish,
      projectedFinishFormatted: formatTime(paceMetrics.projectedFinish),
      caloriesBurned,
      paceConsistency: performance.paceConsistency,
      performanceTrend: performance.performanceTrend,
    };
  }

  /**
   * Get race projections for a member
   */
  getRaceProjection(memberId: string): {
    projectedFinishTime: number;
    projectedFinishTimeFormatted: string;
    remainingTime: number;
    remainingDistance: number;
    requiredPace: number;
    confidence: number;
    obstacleImpact: { timePenalty: number; paceAdjustment: number };
  } {
    const state = store.getState();
    const member = state.team.members.find(m => m.id === memberId);
    const race = state.race;

    if (!member || race.startTime === null) {
      return {
        projectedFinishTime: 0,
        projectedFinishTimeFormatted: '--:--:--',
        remainingTime: 0,
        remainingDistance: race.distance,
        requiredPace: 0,
        confidence: 0,
        obstacleImpact: { timePenalty: 0, paceAdjustment: 0 },
      };
    }

    const timeElapsed = Date.now() - race.startTime;
    const paceHistory = this.paceHistory.get(memberId) || [];

    const projection = calculateRaceProjection(
      race.distance,
      member.distanceCovered,
      timeElapsed,
      paceHistory
    );

    const obstacleImpact = calculateObstacleImpact(
      race.obstacles.length,
      race.distance,
      projection.requiredPace
    );

    return {
      ...projection,
      obstacleImpact,
    };
  }

  /**
   * Get team overview analytics
   */
  getTeamAnalytics(): {
    totalMembers: number;
    activeMembers: number;
    averagePace: number;
    fastestMember: string;
    slowestMember: string;
    teamSpread: number; // distance between farthest members in meters
    safetyAlerts: string[];
  } {
    const state = store.getState();
    const { members } = state.team;
    const { race } = state;

    if (members.length === 0 || race.startTime === null) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        averagePace: 0,
        fastestMember: '',
        slowestMember: '',
        teamSpread: 0,
        safetyAlerts: [],
      };
    }

    const activeMembers = members.filter(m => m.status === 'active');
    const paces = activeMembers.map(member => {
      const metrics = this.getMemberMetrics(member.id);
      return metrics.currentPace;
    }).filter(pace => pace > 0);

    const averagePace = paces.length > 0
      ? paces.reduce((sum, pace) => sum + pace, 0) / paces.length
      : 0;

    // Find fastest and slowest members
    let fastestMember = '';
    let slowestMember = '';
    let maxPace = 0;
    let minPace = Infinity;

    activeMembers.forEach(member => {
      const metrics = this.getMemberMetrics(member.id);
      if (metrics.currentPace > maxPace) {
        maxPace = metrics.currentPace;
        fastestMember = member.name;
      }
      if (metrics.currentPace < minPace && metrics.currentPace > 0) {
        minPace = metrics.currentPace;
        slowestMember = member.name;
      }
    });

    // Calculate team spread
    const teamSpread = this.calculateTeamSpread(activeMembers);

    // Generate safety alerts
    const safetyAlerts = this.generateSafetyAlerts(activeMembers, race);

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      averagePace,
      fastestMember,
      slowestMember,
      teamSpread,
      safetyAlerts,
    };
  }

  /**
   * Update member analytics data
   */
  updateMemberAnalytics(memberId: string, distance: number, timestamp: number): void {
    const state = store.getState();
    const member = state.team.members.find(m => m.id === memberId);
    const race = state.race;

    if (!member || race.startTime === null) return;

    // Calculate current pace
    const timeElapsed = timestamp - race.startTime;
    const currentPace = distance / (timeElapsed / 1000);

    // Update pace history
    const currentPaceHistory = this.paceHistory.get(memberId) || [];
    currentPaceHistory.push(currentPace);
    if (currentPaceHistory.length > 20) {
      currentPaceHistory.shift(); // Keep last 20 readings
    }
    this.paceHistory.set(memberId, currentPaceHistory);

    // Update distance history
    const currentDistanceHistory = this.distanceHistory.get(memberId) || [];
    currentDistanceHistory.push(distance);
    if (currentDistanceHistory.length > 50) {
      currentDistanceHistory.shift(); // Keep last 50 readings
    }
    this.distanceHistory.set(memberId, currentDistanceHistory);
  }

  /**
   * Get performance trends over time
   */
  getPerformanceTrends(memberId: string): Array<{
    timestamp: number;
    pace: number;
    distance: number;
  }> {
    const paceHistory = this.paceHistory.get(memberId) || [];
    const distanceHistory = this.distanceHistory.get(memberId) || [];

    return paceHistory.map((pace, index) => ({
      timestamp: Date.now() - (paceHistory.length - index - 1) * 5000, // Approximate timestamps
      pace,
      distance: distanceHistory[index] || 0,
    }));
  }

  /**
   * Reset analytics for a new race
   */
  resetAnalytics(): void {
    this.paceHistory.clear();
    this.distanceHistory.clear();
  }

  /**
   * Calculate distance between farthest team members
   */
  private calculateTeamSpread(members: any[]): number {
    if (members.length < 2) return 0;

    let maxDistance = 0;

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const member1 = members[i];
        const member2 = members[j];

        if (member1.lastLocation && member2.lastLocation) {
          const distance = this.calculateDistance(
            member1.lastLocation,
            member2.lastLocation
          );

          if (distance > maxDistance) {
            maxDistance = distance;
          }
        }
      }
    }

    return maxDistance;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = (point1.latitude * Math.PI) / 180;
    const lat2 = (point2.latitude * Math.PI) / 180;
    const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Generate safety alerts for the team
   */
  private generateSafetyAlerts(members: any[], race: any): string[] {
    const alerts: string[] = [];
    const currentTime = Date.now();

    members.forEach(member => {
      // Check for stalled members
      if (member.lastUpdate && currentTime - member.lastUpdate > 300000) { // 5 minutes
        alerts.push(`${member.name} has not updated location in 5 minutes`);
      }

      // Check for members who have dropped out
      if (member.status === 'dropped') {
        alerts.push(`${member.name} has dropped out of the race`);
      }

      // Check distance from team average
      const teamSpread = this.calculateTeamSpread(members);
      if (teamSpread > 1000) { // 1km spread
        alerts.push('Team members are spread out - consider regrouping');
      }
    });

    return alerts;
  }

  /**
   * Estimate calories burned
   */
  private estimateCalories(distance: number, pace: number): number {
    // Rough estimation based on MET values
    const averageWeight = 70; // kg
    const met = pace > 3 ? 9.8 : 7.0; // Higher MET for faster pace
    const timeHours = distance / pace / 3600;

    return Math.round(met * averageWeight * timeHours);
  }

  /**
   * Get default metrics when no data available
   */
  private getDefaultMetrics() {
    return {
      currentPace: 0,
      averagePace: 0,
      pacePerKm: '--:--',
      distanceCovered: 0,
      timeElapsed: 0,
      projectedFinish: 0,
      projectedFinishFormatted: '--:--:--',
      caloriesBurned: 0,
      paceConsistency: 0,
      performanceTrend: 'stable',
    };
  }
}

export const analyticsService = new AnalyticsService();
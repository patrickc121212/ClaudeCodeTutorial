// Race projections and performance analysis utilities

export interface RaceProjection {
  projectedFinishTime: number; // timestamp
  projectedFinishTimeFormatted: string;
  remainingTime: number; // milliseconds
  remainingDistance: number; // meters
  requiredPace: number; // meters per second
  confidence: number; // 0-100
}

export interface PerformanceAnalysis {
  currentPace: number;
  averagePace: number;
  paceConsistency: number; // 0-100
  fatigueFactor: number; // 0-1
  performanceTrend: 'improving' | 'stable' | 'declining';
}

export const calculateRaceProjection = (
  raceDistance: number, // meters
  distanceCovered: number, // meters
  timeElapsed: number, // milliseconds
  paceHistory: number[] // meters per second
): RaceProjection => {
  const remainingDistance = Math.max(0, raceDistance - distanceCovered);

  if (distanceCovered === 0 || timeElapsed === 0) {
    return {
      projectedFinishTime: 0,
      projectedFinishTimeFormatted: '--:--:--',
      remainingTime: 0,
      remainingDistance,
      requiredPace: 0,
      confidence: 0,
    };
  }

  // Use weighted average of recent pace for better prediction
  const recentPace = calculateWeightedPace(paceHistory);
  const remainingTime = remainingDistance / recentPace;
  const projectedFinishTime = Date.now() + remainingTime * 1000;

  // Calculate confidence based on pace consistency
  const paceVariance = calculatePaceVariance(paceHistory);
  const confidence = Math.max(0, 100 - (paceVariance * 10));

  return {
    projectedFinishTime,
    projectedFinishTimeFormatted: formatProjectedTime(projectedFinishTime),
    remainingTime: remainingTime * 1000,
    remainingDistance,
    requiredPace: recentPace,
    confidence: Math.min(100, Math.round(confidence)),
  };
};

export const analyzePerformance = (
  paceHistory: number[], // meters per second
  distanceHistory: number[], // meters over time
  raceDuration: number // milliseconds
): PerformanceAnalysis => {
  if (paceHistory.length < 2 || raceDuration < 60000) { // Need at least 1 minute of data
    return {
      currentPace: paceHistory[paceHistory.length - 1] || 0,
      averagePace: calculateAverage(paceHistory),
      paceConsistency: 0,
      fatigueFactor: 0,
      performanceTrend: 'stable',
    };
  }

  const currentPace = paceHistory[paceHistory.length - 1];
  const averagePace = calculateAverage(paceHistory);
  const paceConsistency = calculatePaceConsistency(paceHistory);
  const fatigueFactor = calculateFatigueFactor(paceHistory, distanceHistory, raceDuration);
  const performanceTrend = determinePerformanceTrend(paceHistory);

  return {
    currentPace,
    averagePace,
    paceConsistency,
    fatigueFactor,
    performanceTrend,
  };
};

export const calculateObstacleImpact = (
  obstacleCount: number,
  raceDistance: number,
  averagePace: number
): {
  timePenalty: number; // seconds
  paceAdjustment: number; // meters per second
} => {
  // Estimated time penalty per obstacle (30-90 seconds depending on difficulty)
  const basePenalty = 60; // 60 seconds average
  const totalPenalty = obstacleCount * basePenalty;

  // Adjust pace expectation based on obstacles
  const paceAdjustment = averagePace * 0.1; // 10% reduction for obstacles

  return {
    timePenalty: totalPenalty,
    paceAdjustment,
  };
};

export const calculateTransitionPointTiming = (
  transitionPoints: number[], // meter positions
  currentDistance: number, // meters
  currentPace: number // meters per second
): Array<{
  position: number;
  projectedTime: number;
  timeFormatted: string;
  distanceToGo: number;
}> => {
  return transitionPoints.map(position => {
    const distanceToGo = Math.max(0, position - currentDistance);
    const timeToReach = distanceToGo / currentPace;
    const projectedTime = Date.now() + timeToReach * 1000;

    return {
      position,
      projectedTime,
      timeFormatted: formatProjectedTime(projectedTime),
      distanceToGo,
    };
  }).filter(point => point.distanceToGo > 0);
};

// Helper functions
const calculateWeightedPace = (paceHistory: number[]): number => {
  if (paceHistory.length === 0) return 0;

  // Give more weight to recent readings
  const weights = paceHistory.map((_, index) =>
    Math.pow(0.8, paceHistory.length - index - 1)
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  return paceHistory.reduce((sum, pace, index) =>
    sum + pace * weights[index], 0
  ) / totalWeight;
};

const calculatePaceVariance = (paceHistory: number[]): number => {
  if (paceHistory.length < 2) return 0;

  const average = calculateAverage(paceHistory);
  const variance = paceHistory.reduce((sum, pace) =>
    sum + Math.pow(pace - average, 2), 0
  ) / paceHistory.length;

  return Math.sqrt(variance);
};

const calculatePaceConsistency = (paceHistory: number[]): number => {
  const variance = calculatePaceVariance(paceHistory);
  const average = calculateAverage(paceHistory);

  if (average === 0) return 0;

  // Consistency as percentage (100% = perfectly consistent)
  const consistency = Math.max(0, 100 - (variance / average) * 100);
  return Math.min(100, consistency);
};

const calculateFatigueFactor = (
  paceHistory: number[],
  distanceHistory: number[],
  raceDuration: number
): number => {
  if (paceHistory.length < 3) return 0;

  // Split into thirds and compare pace
  const third = Math.floor(paceHistory.length / 3);
  const firstThird = paceHistory.slice(0, third);
  const lastThird = paceHistory.slice(-third);

  const earlyPace = calculateAverage(firstThird);
  const latePace = calculateAverage(lastThird);

  if (earlyPace === 0) return 0;

  // Fatigue factor: how much pace has dropped
  return Math.max(0, (earlyPace - latePace) / earlyPace);
};

const determinePerformanceTrend = (paceHistory: number[]): 'improving' | 'stable' | 'declining' => {
  if (paceHistory.length < 3) return 'stable';

  const recent = paceHistory.slice(-3);
  const trend = recent[2] - recent[0];

  if (trend > 0.1) return 'improving';
  if (trend < -0.1) return 'declining';
  return 'stable';
};

const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

const formatProjectedTime = (timestamp: number): string => {
  if (timestamp === 0) return '--:--:--';

  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};
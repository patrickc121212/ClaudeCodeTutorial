// Pace calculation utilities for Spartan race tracking

export interface PaceMetrics {
  currentPace: number; // meters per second
  averagePace: number;
  pacePerKm: string; // mm:ss/km format
  projectedFinish: number; // milliseconds
}

export const calculatePace = (
  distanceCovered: number, // meters
  timeElapsed: number // milliseconds
): PaceMetrics => {
  if (timeElapsed === 0 || distanceCovered === 0) {
    return {
      currentPace: 0,
      averagePace: 0,
      pacePerKm: '--:--',
      projectedFinish: 0,
    };
  }

  const timeInSeconds = timeElapsed / 1000;
  const currentPace = distanceCovered / timeInSeconds;
  const averagePace = currentPace;

  // Calculate pace per km in mm:ss format
  const minutesPerKm = 1000 / currentPace / 60;
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  const pacePerKm = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    currentPace,
    averagePace,
    pacePerKm,
    projectedFinish: timeElapsed + ((1000 - distanceCovered) / currentPace) * 1000,
  };
};

export const calculateProjectedFinishTime = (
  raceDistance: number, // meters
  distanceCovered: number, // meters
  timeElapsed: number // milliseconds
): number => {
  if (distanceCovered === 0) return 0;

  const pace = distanceCovered / (timeElapsed / 1000);
  const remainingDistance = raceDistance - distanceCovered;
  const remainingTime = remainingDistance / pace;

  return Date.now() + remainingTime * 1000;
};

export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateCaloriesBurned = (
  weight: number, // kg
  distance: number, // meters
  pace: number // meters per second
): number => {
  // Rough estimation: calories = MET * weight * time
  // MET values for running vary by pace
  const met = pace > 3 ? 9.8 : 7.0; // Higher MET for faster pace
  const timeHours = distance / pace / 3600;

  return Math.round(met * weight * timeHours);
};

export const validateGPSAccuracy = (
  accuracy: number,
  threshold: number = 10
): boolean => {
  return accuracy <= threshold;
};

export const calculateDistanceBetweenPoints = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  // Haversine formula for calculating distance between two GPS points
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

  return R * c; // Distance in meters
};
// GPS accuracy and optimization utilities

export interface GPSQuality {
  accuracy: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendedAction: string;
}

export const assessGPSQuality = (accuracy: number): GPSQuality => {
  if (accuracy <= 5) {
    return {
      accuracy,
      quality: 'excellent',
      recommendedAction: 'GPS accuracy is optimal for race tracking',
    };
  } else if (accuracy <= 10) {
    return {
      accuracy,
      quality: 'good',
      recommendedAction: 'GPS accuracy is acceptable for race tracking',
    };
  } else if (accuracy <= 20) {
    return {
      accuracy,
      quality: 'fair',
      recommendedAction: 'Consider moving to open area for better GPS signal',
    };
  } else {
    return {
      accuracy,
      quality: 'poor',
      recommendedAction: 'GPS signal weak. Move to open area and ensure location services are enabled',
    };
  }
};

export const optimizeGPSAccuracy = (
  currentAccuracy: number,
  history: number[],
  threshold: number = 10
): {
  shouldUpdate: boolean;
  confidence: number;
} => {
  // Calculate confidence based on recent accuracy readings
  const recentReadings = history.slice(-5); // Last 5 readings
  const averageAccuracy = recentReadings.length > 0
    ? recentReadings.reduce((sum, acc) => sum + acc, 0) / recentReadings.length
    : currentAccuracy;

  const confidence = Math.max(0, 1 - (averageAccuracy / threshold));

  // Only update if current reading is better than average or meets threshold
  const shouldUpdate = currentAccuracy <= threshold || currentAccuracy < averageAccuracy;

  return {
    shouldUpdate,
    confidence: Math.round(confidence * 100),
  };
};

export const calculateBatteryOptimizedInterval = (
  raceStatus: 'pre-race' | 'active' | 'paused' | 'completed',
  gpsQuality: GPSQuality,
  batteryLevel?: number
): number => {
  // Return interval in milliseconds
  const baseIntervals = {
    'pre-race': 30000, // 30 seconds
    'active': 5000,    // 5 seconds during race
    'paused': 60000,   // 1 minute when paused
    'completed': 0,     // No tracking when completed
  };

  let interval = baseIntervals[raceStatus];

  // Adjust based on GPS quality
  if (gpsQuality.quality === 'poor') {
    interval *= 2; // Less frequent updates for poor GPS
  } else if (gpsQuality.quality === 'excellent') {
    interval = Math.max(2000, interval / 2); // More frequent for excellent GPS
  }

  // Adjust based on battery level if available
  if (batteryLevel !== undefined && batteryLevel < 20) {
    interval *= 3; // Much less frequent when battery is low
  } else if (batteryLevel !== undefined && batteryLevel < 50) {
    interval *= 1.5; // Less frequent when battery is medium
  }

  return interval;
};

export const validateLocationForRaceTracking = (
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  },
  previousLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  }
): {
  isValid: boolean;
  reason?: string;
  speed?: number;
} => {
  // Check if location is recent
  const age = Date.now() - location.timestamp;
  if (age > 30000) { // 30 seconds old
    return {
      isValid: false,
      reason: 'Location data is too old',
    };
  }

  // Check accuracy
  if (location.accuracy > 50) { // 50 meter threshold
    return {
      isValid: false,
      reason: 'GPS accuracy is too low for reliable tracking',
    };
  }

  // Check for reasonable movement if previous location exists
  if (previousLocation) {
    const timeDiff = (location.timestamp - previousLocation.timestamp) / 1000; // seconds
    const distance = calculateHaversineDistance(
      previousLocation.latitude,
      previousLocation.longitude,
      location.latitude,
      location.longitude
    );

    const speed = distance / timeDiff; // meters per second

    // Validate speed (max 10 m/s ~ 36 km/h for Spartan race)
    if (speed > 10) {
      return {
        isValid: false,
        reason: 'Unrealistic speed detected',
        speed,
      };
    }

    return {
      isValid: true,
      speed,
    };
  }

  return {
    isValid: true,
  };
};

const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getGPSStatusMessage = (accuracy: number): string => {
  if (accuracy <= 5) return 'Excellent GPS signal';
  if (accuracy <= 10) return 'Good GPS signal';
  if (accuracy <= 20) return 'Fair GPS signal';
  if (accuracy <= 50) return 'Poor GPS signal';
  return 'Very poor GPS signal - consider moving to open area';
};
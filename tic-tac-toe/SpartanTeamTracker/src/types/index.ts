// Core application types
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RaceCourse {
  id: string;
  name: string;
  type: 'sprint' | 'super' | 'beast' | 'ultra';
  distance: number; // meters
  coordinates: Coordinate[];
  obstacles: {
    position: number; // meters from start
    name: string;
    type: string;
  }[];
  transitionPoints?: {
    position: number;
    name: string;
  }[];
}

export interface PerformanceMetrics {
  currentPace: number; // meters per second
  averagePace: number;
  projectedFinishTime: number; // milliseconds
  distanceCovered: number; // meters
  timeElapsed: number; // milliseconds
  caloriesBurned: number;
}

export interface SafetyAlert {
  id: string;
  type: 'stalled' | 'distance' | 'emergency' | 'battery';
  memberId: string;
  message: string;
  timestamp: number;
  resolved: boolean;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Race: { raceId?: string };
  Team: { teamId?: string };
  Analytics: { raceId?: string };
};

// Firebase document interfaces
export interface RaceDocument {
  id: string;
  name: string;
  type: string;
  status: string;
  startTime: number | null;
  teamId: string;
  course: RaceCourse;
}

export interface TeamDocument {
  id: string;
  name: string;
  captainId: string;
  memberIds: string[];
  raceId: string;
}

export interface MemberDocument {
  id: string;
  name: string;
  teamId: string;
  raceId: string;
  status: string;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy: number;
  };
  pace?: number;
  distanceCovered: number;
}
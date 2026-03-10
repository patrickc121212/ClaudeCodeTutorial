import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LocationState {
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    altitude?: number;
    speed?: number;
  } | null;
  trackingEnabled: boolean;
  backgroundTracking: boolean;
  lastUpdate: number;
  accuracyThreshold: number; // Minimum accuracy threshold in meters
}

const initialState: LocationState = {
  currentLocation: null,
  trackingEnabled: false,
  backgroundTracking: false,
  lastUpdate: 0,
  accuracyThreshold: 10, // 10 meter accuracy threshold
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (
      state,
      action: PayloadAction<LocationState['currentLocation']>
    ) => {
      if (action.payload && action.payload.accuracy <= state.accuracyThreshold) {
        state.currentLocation = action.payload;
        state.lastUpdate = Date.now();
      }
    },
    setTrackingEnabled: (state, action: PayloadAction<boolean>) => {
      state.trackingEnabled = action.payload;
    },
    setBackgroundTracking: (state, action: PayloadAction<boolean>) => {
      state.backgroundTracking = action.payload;
    },
    setAccuracyThreshold: (state, action: PayloadAction<number>) => {
      state.accuracyThreshold = action.payload;
    },
    resetLocation: (state) => {
      state.currentLocation = null;
      state.lastUpdate = 0;
    },
  },
});

export const {
  setCurrentLocation,
  setTrackingEnabled,
  setBackgroundTracking,
  setAccuracyThreshold,
  resetLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
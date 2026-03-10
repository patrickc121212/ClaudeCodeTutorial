import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RaceState {
  id: string | null;
  name: string;
  type: 'sprint' | 'super' | 'beast' | 'ultra';
  status: 'pre-race' | 'active' | 'completed' | 'paused';
  startTime: number | null;
  endTime: number | null;
  distance: number; // in meters
  obstacles: number[]; // obstacle positions along the course
  transitionPoints: number[]; // transition point positions for ultras
}

const initialState: RaceState = {
  id: null,
  name: '',
  type: 'sprint',
  status: 'pre-race',
  startTime: null,
  endTime: null,
  distance: 0,
  obstacles: [],
  transitionPoints: [],
};

const raceSlice = createSlice({
  name: 'race',
  initialState,
  reducers: {
    setRace: (state, action: PayloadAction<Partial<RaceState>>) => {
      return { ...state, ...action.payload };
    },
    startRace: (state) => {
      state.status = 'active';
      state.startTime = Date.now();
    },
    pauseRace: (state) => {
      state.status = 'paused';
    },
    resumeRace: (state) => {
      state.status = 'active';
    },
    completeRace: (state) => {
      state.status = 'completed';
      state.endTime = Date.now();
    },
    setRaceType: (state, action: PayloadAction<RaceState['type']>) => {
      state.type = action.payload;
      // Set default distances based on race type
      const distances = {
        sprint: 5000, // 5km
        super: 13000, // 13km
        beast: 21000, // 21km
        ultra: 42000, // 42km
      };
      state.distance = distances[action.payload];
    },
  },
});

export const {
  setRace,
  startRace,
  pauseRace,
  resumeRace,
  completeRace,
  setRaceType,
} = raceSlice.actions;

export default raceSlice.reducer;
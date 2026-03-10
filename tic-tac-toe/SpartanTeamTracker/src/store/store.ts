import { configureStore } from '@reduxjs/toolkit';
import raceReducer from './raceSlice';
import teamReducer from './teamSlice';
import locationReducer from './locationSlice';

export const store = configureStore({
  reducer: {
    race: raceReducer,
    team: teamReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
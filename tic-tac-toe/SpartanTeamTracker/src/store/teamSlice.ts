import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TeamMember {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'dropped';
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
  };
  pace?: number; // meters per second
  distanceCovered: number; // in meters
  lastUpdate: number;
}

export interface TeamState {
  id: string | null;
  name: string;
  members: TeamMember[];
  captainId: string | null;
}

const initialState: TeamState = {
  id: null,
  name: '',
  members: [],
  captainId: null,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeam: (state, action: PayloadAction<Partial<TeamState>>) => {
      return { ...state, ...action.payload };
    },
    addMember: (state, action: PayloadAction<TeamMember>) => {
      state.members.push(action.payload);
    },
    removeMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter(member => member.id !== action.payload);
    },
    updateMemberLocation: (
      state,
      action: PayloadAction<{
        memberId: string;
        location: TeamMember['lastLocation'];
      }>
    ) => {
      const member = state.members.find(m => m.id === action.payload.memberId);
      if (member) {
        member.lastLocation = action.payload.location;
        member.lastUpdate = Date.now();
      }
    },
    updateMemberStatus: (
      state,
      action: PayloadAction<{
        memberId: string;
        status: TeamMember['status'];
      }>
    ) => {
      const member = state.members.find(m => m.id === action.payload.memberId);
      if (member) {
        member.status = action.payload.status;
      }
    },
    setCaptain: (state, action: PayloadAction<string>) => {
      state.captainId = action.payload;
    },
  },
});

export const {
  setTeam,
  addMember,
  removeMember,
  updateMemberLocation,
  updateMemberStatus,
  setCaptain,
} = teamSlice.actions;

export default teamSlice.reducer;
// Mock Firebase service for offline testing

import { store } from '@/store/store';
import { setRace } from '@/store/raceSlice';
import { setTeam, addMember, removeMember, updateMemberStatus, updateMemberLocation } from '@/store/teamSlice';

class MockFirebaseService {
  private isConnected = true;
  private mockData = {
    races: {},
    teams: {},
    members: {},
  };

  constructor() {
    console.log('🔥 Mock Firebase Service initialized (offline mode)');
    this.setupMockData();
  }

  private setupMockData(): void {
    // Create some mock data for testing
    this.mockData = {
      races: {
        'mock-race-1': {
          id: 'mock-race-1',
          name: 'Test Spartan Race',
          type: 'sprint',
          status: 'pre-race',
          startTime: null,
          endTime: null,
          distance: 5000,
          obstacles: [1000, 2000, 3000, 4000],
          transitionPoints: [],
        },
      },
      teams: {
        'mock-team-1': {
          id: 'mock-team-1',
          name: 'Spartan Warriors',
          captainId: 'mock-member-1',
          memberIds: ['mock-member-1', 'mock-member-2', 'mock-member-3'],
        },
      },
      members: {
        'mock-member-1': {
          id: 'mock-member-1',
          name: 'Alex Runner',
          status: 'active',
          distanceCovered: 0,
          lastUpdate: Date.now(),
        },
        'mock-member-2': {
          id: 'mock-member-2',
          name: 'Taylor Sprinter',
          status: 'active',
          distanceCovered: 0,
          lastUpdate: Date.now(),
        },
        'mock-member-3': {
          id: 'mock-member-3',
          name: 'Jordan Marathon',
          status: 'active',
          distanceCovered: 0,
          lastUpdate: Date.now(),
        },
      },
    };
  }

  async createRace(raceData: {
    name: string;
    type: 'sprint' | 'super' | 'beast' | 'ultra';
    teamName: string;
    members: string[];
  }): Promise<string | null> {
    console.log('📝 Creating mock race:', raceData.name);

    const raceId = `mock-race-${Date.now()}`;
    const teamId = `mock-team-${Date.now()}`;

    // Update Redux store
    store.dispatch(setRace({
      id: raceId,
      name: raceData.name,
      type: raceData.type,
      status: 'pre-race',
      startTime: null,
      distance: this.getRaceDistance(raceData.type),
      obstacles: this.generateObstacles(raceData.type),
    }));

    // Add mock members
    raceData.members.forEach((memberName, index) => {
      const memberId = `mock-member-${Date.now()}-${index}`;
      const newMember = {
        id: memberId,
        name: memberName,
        status: 'active' as const,
        distanceCovered: 0,
        lastUpdate: Date.now(),
      };
      store.dispatch(addMember(newMember));
    });

    return raceId;
  }

  async joinRace(raceId: string, memberName: string): Promise<boolean> {
    console.log('👥 Mock member joining race:', memberName);

    const memberId = `mock-member-${Date.now()}`;
    const newMember = {
      id: memberId,
      name: memberName,
      status: 'active' as const,
      distanceCovered: 0,
      lastUpdate: Date.now(),
    };

    store.dispatch(addMember(newMember));
    return true;
  }

  listenToRace(raceId: string): void {
    console.log('👂 Mock listening to race:', raceId);

    // Simulate real-time updates
    setInterval(() => {
      this.simulateRaceProgress();
    }, 5000); // Update every 5 seconds
  }

  async updateMemberLocation(location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  }): Promise<void> {
    // This would update the current user's location
    const mockMemberId = 'current-user';

    store.dispatch(updateMemberLocation({
      memberId: mockMemberId,
      location,
    }));
  }

  async updateMemberStatus(status: 'active' | 'paused' | 'completed' | 'dropped'): Promise<void> {
    const mockMemberId = 'current-user';

    store.dispatch(updateMemberStatus({
      memberId: mockMemberId,
      status,
    }));
  }

  async updateRaceStatus(raceId: string, status: string, data?: any): Promise<void> {
    const updates: any = { status };

    if (status === 'active' && !data?.startTime) {
      updates.startTime = Date.now();
    } else if (status === 'completed') {
      updates.endTime = Date.now();
    }

    store.dispatch(setRace(updates));
  }

  stopListening(): void {
    console.log('🔇 Mock Firebase stopped listening');
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getUserId(): string | null {
    return 'mock-user-' + Date.now();
  }

  private getRaceDistance(raceType: string): number {
    const distances = {
      sprint: 5000,
      super: 13000,
      beast: 21000,
      ultra: 42000,
    };
    return distances[raceType as keyof typeof distances] || 5000;
  }

  private generateObstacles(raceType: string): number[] {
    const obstacleCounts = {
      sprint: 4,
      super: 8,
      beast: 12,
      ultra: 25,
    };

    const count = obstacleCounts[raceType as keyof typeof obstacleCounts] || 4;
    const obstacles: number[] = [];
    const distance = this.getRaceDistance(raceType);

    for (let i = 1; i <= count; i++) {
      obstacles.push(Math.round((distance / count) * i));
    }

    return obstacles;
  }

  private simulateRaceProgress(): void {
    const state = store.getState();
    const { race, team } = state;

    if (race.status === 'active' && race.startTime) {
      // Simulate member progress
      team.members.forEach((member) => {
        if (member.status === 'active') {
          // Simulate distance covered based on time
          const timeElapsed = Date.now() - race.startTime!;
          const simulatedDistance = Math.min(
            race.distance,
            (timeElapsed / 1000) * 3 // 3 m/s average pace
          );

          // Update member with simulated location
          const simulatedLocation = {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
            accuracy: 5 + Math.random() * 5,
            timestamp: Date.now(),
          };

          store.dispatch(updateMemberLocation({
            memberId: member.id,
            location: simulatedLocation,
          }));

          // Update distance covered
          const updatedMember = {
            ...member,
            distanceCovered: Math.round(simulatedDistance),
            lastUpdate: Date.now(),
          };

          // This would normally be handled by Redux, but we need to simulate it
          store.dispatch(updateMemberStatus({
            memberId: member.id,
            status: member.status,
          }));
        }
      });
    }
  }
}

export const mockFirebaseService = new MockFirebaseService();
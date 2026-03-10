// Mock Location service for offline testing

import { store } from '@/store/store';
import { setCurrentLocation, setTrackingEnabled } from '@/store/locationSlice';
import { updateMemberLocation } from '@/store/teamSlice';

class MockLocationService {
  private locationSubscription: any = null;
  private isTracking = false;
  private mockInterval: any = null;

  async startTracking(): Promise<boolean> {
    console.log('📍 Mock Location Service: Starting tracking');

    // Set initial mock location (San Francisco)
    const initialLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5,
      timestamp: Date.now(),
    };

    store.dispatch(setCurrentLocation(initialLocation));
    store.dispatch(setTrackingEnabled(true));

    // Start simulating location updates
    this.startMockLocationUpdates();

    this.isTracking = true;
    return true;
  }

  async stopTracking(): Promise<void> {
    console.log('📍 Mock Location Service: Stopping tracking');

    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }

    store.dispatch(setTrackingEnabled(false));
    this.isTracking = false;
  }

  private startMockLocationUpdates(): void {
    // Simulate location updates every 3 seconds
    this.mockInterval = setInterval(() => {
      this.simulateLocationUpdate();
    }, 3000);
  }

  private simulateLocationUpdate(): void {
    const state = store.getState();
    const { race, team } = state;

    if (!this.isTracking) return;

    // Generate realistic location movement
    const currentLocation = state.location.currentLocation || {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5,
      timestamp: Date.now(),
    };

    // Simulate movement (small random changes)
    const newLocation = {
      latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.0001,
      longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.0001,
      accuracy: 3 + Math.random() * 4, // 3-7 meter accuracy
      timestamp: Date.now(),
      speed: 2 + Math.random() * 3, // 2-5 m/s
    };

    // Update current location
    store.dispatch(setCurrentLocation(newLocation));

    // Update team member location if in active race
    if (race.status === 'active') {
      store.dispatch(updateMemberLocation({
        memberId: 'current-user',
        location: {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          timestamp: newLocation.timestamp,
          accuracy: newLocation.accuracy,
        },
      }));
    }

    // Simulate other team members if in a team
    if (team.members.length > 0 && race.status === 'active') {
      team.members
        .filter(member => member.id !== 'current-user' && member.status === 'active')
        .forEach((member, index) => {
          // Simulate team member locations (spread out but moving together)
          const teamMemberLocation = {
            latitude: newLocation.latitude + (index * 0.00005),
            longitude: newLocation.longitude + (index * 0.00005),
            timestamp: Date.now(),
            accuracy: 5 + Math.random() * 5,
          };

          store.dispatch(updateMemberLocation({
            memberId: member.id,
            location: teamMemberLocation,
          }));
        });
    }
  }

  async getCurrentLocation(): Promise<any> {
    const state = store.getState();
    return state.location.currentLocation || {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5,
      timestamp: Date.now(),
    };
  }

  async checkLocationServices(): Promise<{
    available: boolean;
    enabled: boolean;
    permission: string;
  }> {
    return {
      available: true,
      enabled: true,
      permission: 'granted',
    };
  }

  getAccuracyStats(): {
    currentAccuracy: number;
    averageAccuracy: number;
    bestAccuracy: number;
    quality: string;
  } {
    const state = store.getState();
    const currentAccuracy = state.location.currentLocation?.accuracy || 10;

    return {
      currentAccuracy,
      averageAccuracy: currentAccuracy,
      bestAccuracy: Math.min(3, currentAccuracy),
      quality: currentAccuracy <= 5 ? 'excellent' : currentAccuracy <= 10 ? 'good' : 'fair',
    };
  }
}

export const mockLocationService = new MockLocationService();
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { store } from '@/store/store';
import { setCurrentLocation, setTrackingEnabled } from '@/store/locationSlice';
import { updateMemberLocation } from '@/store/teamSlice';
import { assessGPSQuality, optimizeGPSAccuracy, calculateBatteryOptimizedInterval } from '@/utils/GPSAccuracy';

class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;
  private backgroundTask: any = null;
  private accuracyHistory: number[] = [];
  private isTracking = false;
  private currentInterval = 5000; // Default 5 seconds

  /**
   * Request location permissions and start tracking
   */
  async startTracking(): Promise<boolean> {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return false;
      }

      // For background tracking on iOS
      if (Platform.OS === 'ios') {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus.status !== 'granted') {
          console.warn('Background location permission not granted');
        }
      }

      // Start foreground tracking
      await this.startForegroundTracking();

      // Start background tracking if permitted
      if (Platform.OS === 'ios') {
        await this.startBackgroundTracking();
      }

      store.dispatch(setTrackingEnabled(true));
      this.isTracking = true;
      return true;

    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop all location tracking
   */
  async stopTracking(): Promise<void> {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    if (this.backgroundTask) {
      await Location.stopLocationUpdatesAsync('spartanBackgroundTracking');
      this.backgroundTask = null;
    }

    store.dispatch(setTrackingEnabled(false));
    this.isTracking = false;
    this.accuracyHistory = [];
  }

  /**
   * Start foreground location tracking with optimized intervals
   */
  private async startForegroundTracking(): Promise<void> {
    // Get current location first
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    this.processLocationUpdate(location);

    // Start watching position with optimized interval
    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: this.currentInterval,
        distanceInterval: 5, // Update every 5 meters
        mayShowUserSettingsDialog: true,
      },
      (location) => {
        this.processLocationUpdate(location);
        this.optimizeTrackingInterval(location.coords.accuracy || 50);
      }
    );
  }

  /**
   * Start background location tracking for iOS
   */
  private async startBackgroundTracking(): Promise<void> {
    try {
      this.backgroundTask = await Location.startLocationUpdatesAsync(
        'spartanBackgroundTracking',
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 30000, // 30 seconds in background
          distanceInterval: 50, // 50 meters in background
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Spartan Race Tracking',
            notificationBody: 'Tracking your location for team safety',
          },
        }
      );

      // Listen for background location updates
      Location.EventEmitter.addListener(
        'Expo.locationUpdate',
        ({ location }: { location: Location.LocationObject }) => {
          this.processLocationUpdate(location);
        }
      );

    } catch (error) {
      console.warn('Background tracking not available:', error);
    }
  }

  /**
   * Process location update and update store
   */
  private processLocationUpdate(location: Location.LocationObject): void {
    const { coords, timestamp } = location;

    // Validate location quality
    const gpsQuality = assessGPSQuality(coords.accuracy || 50); // Default to 50m if null

    if (gpsQuality.quality !== 'poor') {
      // Update current location in store
      store.dispatch(setCurrentLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy || 50,
        timestamp,
        altitude: coords.altitude || undefined,
        speed: coords.speed || undefined,
      }));

      // Update team member location if tracking active race
      const state = store.getState();
      if (state.race.status === 'active' && state.race.startTime) {
        store.dispatch(updateMemberLocation({
          memberId: 'current-user', // TODO: Replace with actual user ID
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp,
            accuracy: coords.accuracy || 50,
          },
        }));
      }

      // Add to accuracy history for optimization
      if (coords.accuracy !== null) {
        this.accuracyHistory.push(coords.accuracy);
        if (this.accuracyHistory.length > 10) {
          this.accuracyHistory.shift();
        }
      }
    }
  }

  /**
   * Optimize tracking interval based on GPS quality and battery considerations
   */
  private optimizeTrackingInterval(currentAccuracy: number): void {
    const state = store.getState();

    const optimization = optimizeGPSAccuracy(
      currentAccuracy,
      this.accuracyHistory,
      state.location.accuracyThreshold
    );

    const newInterval = calculateBatteryOptimizedInterval(
      state.race.status,
      assessGPSQuality(currentAccuracy)
      // Battery level would come from a battery monitoring service
    );

    // Only update if significant change
    if (Math.abs(newInterval - this.currentInterval) > 1000) {
      this.currentInterval = newInterval;

      // Restart tracking with new interval
      if (this.isTracking) {
        this.stopTracking().then(() => {
          this.startTracking();
        });
      }
    }
  }

  /**
   * Get current location with high accuracy
   */
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Check if location services are available and enabled
   */
  async checkLocationServices(): Promise<{
    available: boolean;
    enabled: boolean;
    permission: Location.PermissionStatus;
  }> {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      const permission = await Location.getForegroundPermissionsAsync();

      return {
        available: true,
        enabled,
        permission: permission.status,
      };
    } catch (error) {
      return {
        available: false,
        enabled: false,
        permission: Location.PermissionStatus.UNDETERMINED,
      };
    }
  }

  /**
   * Get location accuracy statistics
   */
  getAccuracyStats(): {
    currentAccuracy: number;
    averageAccuracy: number;
    bestAccuracy: number;
    quality: string;
  } {
    if (this.accuracyHistory.length === 0) {
      return {
        currentAccuracy: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        quality: 'unknown',
      };
    }

    const currentAccuracy = this.accuracyHistory[this.accuracyHistory.length - 1];
    const averageAccuracy = this.accuracyHistory.reduce((sum, acc) => sum + acc, 0) / this.accuracyHistory.length;
    const bestAccuracy = Math.min(...this.accuracyHistory);
    const quality = assessGPSQuality(currentAccuracy).quality;

    return {
      currentAccuracy,
      averageAccuracy,
      bestAccuracy,
      quality,
    };
  }
}

export const locationService = new LocationService();
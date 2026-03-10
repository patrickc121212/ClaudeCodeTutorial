import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { store } from '@/store/store';
import { HomeScreen } from '@/screens/HomeScreen';
import { RaceScreen } from '@/screens/RaceScreen';
import { TeamScreen } from '@/screens/TeamScreen';
import { AnalyticsScreen } from '@/screens/AnalyticsScreen';
import { mockFirebaseService } from '@/services/MockFirebaseService';
import { mockLocationService } from '@/services/MockLocationService';
import { initializeDemoData } from '@/utils/DemoData';

const Stack = createStackNavigator();

// Mock services initialization component
const MockServicesInitializer = () => {
  useEffect(() => {
    console.log('🚀 Mock services initialized for offline testing');

    // Initialize demo data
    initializeDemoData();

    // Initialize mock services
    mockFirebaseService.listenToRace('mock-race-1');

    // Auto-start location tracking in demo mode
    mockLocationService.startTracking();

    return () => {
      mockFirebaseService.stopListening();
      mockLocationService.stopTracking();
    };
  }, []);

  return null;
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <MockServicesInitializer />
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Spartan Team Tracker (Demo)' }}
            />
            <Stack.Screen
              name="Race"
              component={RaceScreen}
              options={{ title: 'Race Tracking' }}
            />
            <Stack.Screen
              name="Team"
              component={TeamScreen}
              options={{ title: 'Team Management' }}
            />
            <Stack.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{ title: 'Performance Analytics' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </Provider>
  );
}
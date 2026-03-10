// Demo data for testing the app without external services

import { store } from '@/store/store';
import { setRace, setRaceType } from '@/store/raceSlice';
import { setTeam, addMember, setCaptain } from '@/store/teamSlice';

export const initializeDemoData = () => {
  console.log('🎮 Initializing demo data...');

  // Set up a demo race
  const demoRace = {
    id: 'demo-race-1',
    name: 'Spartan Sprint Demo',
    type: 'sprint' as const,
    status: 'pre-race' as const,
    startTime: null,
    endTime: null,
    distance: 5000,
    obstacles: [1000, 2000, 3000, 4000],
    transitionPoints: [],
  };

  store.dispatch(setRace(demoRace));
  store.dispatch(setRaceType('sprint'));

  // Set up demo team
  const demoTeam = {
    id: 'demo-team-1',
    name: 'Spartan Warriors',
    captainId: null,
    members: [],
  };

  store.dispatch(setTeam(demoTeam));

  // Add demo team members
  const demoMembers = [
    {
      id: 'demo-member-1',
      name: 'Alex Runner',
      status: 'active' as const,
      distanceCovered: 0,
      lastUpdate: Date.now(),
    },
    {
      id: 'demo-member-2',
      name: 'Taylor Sprinter',
      status: 'active' as const,
      distanceCovered: 0,
      lastUpdate: Date.now(),
    },
    {
      id: 'demo-member-3',
      name: 'Jordan Marathon',
      status: 'active' as const,
      distanceCovered: 0,
      lastUpdate: Date.now(),
    },
    {
      id: 'demo-member-4',
      name: 'Casey Obstacle',
      status: 'paused' as const,
      distanceCovered: 1500,
      lastUpdate: Date.now() - 60000, // 1 minute ago
    },
  ];

  demoMembers.forEach(member => {
    store.dispatch(addMember(member));
  });

  // Set captain
  store.dispatch(setCaptain('demo-member-1'));

  console.log('✅ Demo data initialized with', demoMembers.length, 'team members');
};

export const simulateRaceProgress = () => {
  const state = store.getState();
  const { race, team } = state;

  if (race.status === 'active' && race.startTime) {
    const timeElapsed = Date.now() - race.startTime;
    const progressPercentage = Math.min(100, (timeElapsed / 300000) * 100); // 5-minute demo race

    // Update member distances based on progress
    team.members.forEach((member) => {
      if (member.status === 'active') {
        const distanceCovered = Math.round((race.distance * progressPercentage) / 100);

        // Simulate location updates
        const simulatedLocation = {
          latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
          accuracy: 5 + Math.random() * 5,
          timestamp: Date.now(),
        };

        // Note: In a real implementation, this would dispatch updates
        // For demo purposes, we're just logging
        console.log(`🏃 ${member.name}: ${distanceCovered}m covered`);
      }
    });

    return progressPercentage;
  }

  return 0;
};

export const startDemoRace = () => {
  console.log('🏁 Starting demo race...');

  // Update race status
  store.dispatch(setRace({
    status: 'active',
    startTime: Date.now(),
  }));

  // Start simulating progress
  const progressInterval = setInterval(() => {
    const progress = simulateRaceProgress();

    if (progress >= 100) {
      clearInterval(progressInterval);

      // Complete the race
      store.dispatch(setRace({
        status: 'completed',
        endTime: Date.now(),
      }));

      console.log('🎉 Demo race completed!');
    }
  }, 2000); // Update every 2 seconds

  return progressInterval;
};
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import mapboxConfig, { mapMarkers, raceRegions } from '@/config/mapbox';

const { width, height } = Dimensions.get('window');

interface TeamMapProps {
  showTeamLines?: boolean;
  showRaceCourse?: boolean;
  onMemberPress?: (memberId: string) => void;
}

export const TeamMap: React.FC<TeamMapProps> = ({
  showTeamLines = true,
  showRaceCourse = false,
  onMemberPress,
}) => {
  const team = useSelector((state: RootState) => state.team);
  const race = useSelector((state: RootState) => state.race);
  const location = useSelector((state: RootState) => state.location);

  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: raceRegions.sprint.latitudeDelta,
    longitudeDelta: raceRegions.sprint.longitudeDelta,
  });

  // Update region when team members move
  useEffect(() => {
    const activeMembers = team.members.filter(m => m.status === 'active' && m.lastLocation);

    if (activeMembers.length > 0) {
      // Calculate center of all active members
      const latitudes = activeMembers.map(m => m.lastLocation!.latitude);
      const longitudes = activeMembers.map(m => m.lastLocation!.longitude);

      const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
      const centerLon = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;

      // Calculate appropriate delta based on spread
      const latSpread = Math.max(...latitudes) - Math.min(...latitudes);
      const lonSpread = Math.max(...longitudes) - Math.min(...longitudes);

      // Use appropriate region based on race type
      const raceType = race.type as keyof typeof raceRegions;
      const baseRegion = raceRegions[raceType] || raceRegions.sprint;

      setRegion({
        latitude: centerLat,
        longitude: centerLon,
        latitudeDelta: Math.max(baseRegion.latitudeDelta, latSpread * 1.5),
        longitudeDelta: Math.max(baseRegion.longitudeDelta, lonSpread * 1.5),
      });
    }
  }, [team.members]);

  const getMemberColor = (memberId: string): string => {
    const index = team.members.findIndex(m => m.id === memberId);
    return mapMarkers.teamMember.colors[index % mapMarkers.teamMember.colors.length];
  };

  const getMemberStatus = (memberId: string): string => {
    const member = team.members.find(m => m.id === memberId);
    return member?.status || 'unknown';
  };

  const formatLastUpdate = (timestamp: number): string => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* Current user location */}
        {location.currentLocation && (
          <Marker
            coordinate={{
              latitude: location.currentLocation.latitude,
              longitude: location.currentLocation.longitude,
            }}
            title="You"
            description={`Accuracy: ${location.currentLocation.accuracy.toFixed(1)}m`}
            pinColor="#e74c3c"
          />
        )}

        {/* Team member markers */}
        {team.members
          .filter(member => member.lastLocation && member.status !== 'dropped')
          .map((member) => (
            <Marker
              key={member.id}
              coordinate={{
                latitude: member.lastLocation!.latitude,
                longitude: member.lastLocation!.longitude,
              }}
              title={member.name}
              description={`Status: ${member.status} • ${formatLastUpdate(member.lastUpdate)}`}
              pinColor={getMemberColor(member.id)}
              onPress={() => onMemberPress?.(member.id)}
            />
          ))}

        {/* Connection lines between team members */}
        {showTeamLines && team.members.length > 1 && (
          <>
            {team.members
              .filter(member => member.lastLocation && member.status === 'active')
              .map((member, index, array) => {
                if (index === array.length - 1) return null;

                const nextMember = array[index + 1];
                if (!nextMember.lastLocation) return null;

                return (
                  <Polyline
                    key={`line-${member.id}-${nextMember.id}`}
                    coordinates={[
                      {
                        latitude: member.lastLocation!.latitude,
                        longitude: member.lastLocation!.longitude,
                      },
                      {
                        latitude: nextMember.lastLocation!.latitude,
                        longitude: nextMember.lastLocation!.longitude,
                      },
                    ]}
                    strokeColor={getMemberColor(member.id)}
                    strokeWidth={2}
                    lineDashPattern={[5, 5]}
                  />
                );
              })}
          </>
        )}

        {/* Race course outline (if available) */}
        {showRaceCourse && race.obstacles.length > 0 && (
          <>
            {/* Start line */}
            <Marker
              coordinate={region} // TODO: Replace with actual start coordinates
              title="Start"
              pinColor="#27ae60"
            />

            {/* Obstacle markers */}
            {race.obstacles.map((obstaclePosition, index) => (
              <Marker
                key={`obstacle-${index}`}
                coordinate={{
                  latitude: region.latitude + (index * 0.001),
                  longitude: region.longitude + (index * 0.001),
                }} // TODO: Replace with actual obstacle positions
                title={`Obstacle ${index + 1}`}
                pinColor="#f39c12"
              />
            ))}

            {/* Finish line */}
            <Marker
              coordinate={{
                latitude: region.latitude + (race.obstacles.length * 0.001),
                longitude: region.longitude + (race.obstacles.length * 0.001),
              }} // TODO: Replace with actual finish coordinates
              title="Finish"
              pinColor="#e74c3c"
            />
          </>
        )}
      </MapView>

      {/* GPS Accuracy Indicator */}
      {location.currentLocation && (
        <View style={styles.accuracyIndicator}>
          <View style={[
            styles.accuracyDot,
            {
              backgroundColor: location.currentLocation.accuracy <= 10
                ? '#27ae60'
                : location.currentLocation.accuracy <= 20
                ? '#f39c12'
                : '#e74c3c'
            }
          ]} />
          <View style={styles.accuracyTextContainer}>
            <Text style={styles.accuracyText}>
              GPS: {location.currentLocation.accuracy.toFixed(1)}m
            </Text>
          </View>
        </View>
      )}

      {/* Team Status Overview */}
      <View style={styles.teamStatus}>
        <Text style={styles.teamStatusTitle}>
          Team: {team.members.length} members
        </Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusCount}>
              {team.members.filter(m => m.status === 'active').length}
            </Text>
            <Text style={styles.statusLabel}>Active</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusCount}>
              {team.members.filter(m => m.status === 'paused').length}
            </Text>
            <Text style={styles.statusLabel}>Paused</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusCount}>
              {team.members.filter(m => m.status === 'completed').length}
            </Text>
            <Text style={styles.statusLabel}>Finished</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  accuracyIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  accuracyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  accuracyTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  teamStatus: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  teamStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statusLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
});

export default TeamMap;
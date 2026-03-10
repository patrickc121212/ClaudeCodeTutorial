// Mapbox configuration

import { MAPBOX_ACCESS_TOKEN } from '@env';

// Mapbox configuration
const mapboxConfig = {
  accessToken: MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoiZGVtbyIsImEiOiJjbGV4YWp1N2owMDJjM3BwOGV6cHhia2V3In0.demo-token",
  styleURL: 'mapbox://styles/mapbox/outdoors-v11',
  minZoom: 10,
  maxZoom: 20,
  defaultZoom: 14,
  defaultCenter: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
};

// Map style URLs for different themes
export const mapStyles = {
  outdoor: 'mapbox://styles/mapbox/outdoors-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  street: 'mapbox://styles/mapbox/streets-v11',
  dark: 'mapbox://styles/mapbox/dark-v10',
};

// Map markers configuration
export const mapMarkers = {
  user: {
    color: '#e74c3c',
    size: 20,
  },
  teamMember: {
    colors: ['#e74c3c', '#3498db', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c'],
    size: 15,
  },
  start: {
    color: '#27ae60',
    size: 25,
  },
  finish: {
    color: '#e74c3c',
    size: 25,
  },
  obstacle: {
    color: '#f39c12',
    size: 18,
  },
  transition: {
    color: '#3498db',
    size: 20,
  },
};

// Map region configuration for different race types
export const raceRegions = {
  sprint: {
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  super: {
    latitudeDelta: 0.1844,
    longitudeDelta: 0.0842,
  },
  beast: {
    latitudeDelta: 0.3688,
    longitudeDelta: 0.1684,
  },
  ultra: {
    latitudeDelta: 0.7376,
    longitudeDelta: 0.3368,
  },
};

export default mapboxConfig;
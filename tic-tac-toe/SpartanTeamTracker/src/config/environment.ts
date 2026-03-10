// Environment configuration for development and production

interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  mapbox: {
    accessToken: string;
  };
  app: {
    name: string;
    version: string;
  };
}

// Development configuration
const developmentConfig: EnvironmentConfig = {
  isDevelopment: true,
  isProduction: false,
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "demo-dev-api-key",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "spartan-team-tracker-dev.firebaseapp.com",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://spartan-team-tracker-dev-default-rtdb.firebaseio.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "spartan-team-tracker-dev",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "spartan-team-tracker-dev.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "987654321",
    appId: process.env.FIREBASE_APP_ID || "1:987654321:web:devabcdef123456",
  },
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN || "pk.demo.mapbox-token",
  },
  app: {
    name: "Spartan Team Tracker (Dev)",
    version: "1.0.0-dev",
  },
};

// Production configuration
const productionConfig: EnvironmentConfig = {
  isDevelopment: false,
  isProduction: true,
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "demo-prod-api-key",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "spartan-team-tracker.firebaseapp.com",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://spartan-team-tracker-default-rtdb.firebaseio.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "spartan-team-tracker",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "spartan-team-tracker.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  },
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN || "pk.prod.mapbox-token",
  },
  app: {
    name: "Spartan Team Tracker",
    version: "1.0.0",
  },
};

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Export appropriate configuration
export const config: EnvironmentConfig = isProduction ? productionConfig : developmentConfig;

// Helper functions
export const isDevelopment = (): boolean => config.isDevelopment;
export const isProd = (): boolean => config.isProduction;

// Firebase configuration export for easy access
export const firebaseConfig = config.firebase;
export const mapboxConfig = config.mapbox;

// App info
export const appInfo = config.app;
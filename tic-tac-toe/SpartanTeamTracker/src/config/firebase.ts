// Firebase configuration with environment variables

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_DATABASE_URL, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID } from '@env';

// Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY || "demo-api-key",
  authDomain: FIREBASE_AUTH_DOMAIN || "spartan-team-tracker.firebaseapp.com",
  databaseURL: FIREBASE_DATABASE_URL || "https://spartan-team-tracker-default-rtdb.firebaseio.com",
  projectId: FIREBASE_PROJECT_ID || "spartan-team-tracker",
  storageBucket: FIREBASE_STORAGE_BUCKET || "spartan-team-tracker.appspot.com",
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
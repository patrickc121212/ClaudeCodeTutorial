#!/usr/bin/env node

// Validation script for Firebase and Mapbox setup

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Spartan Team Tracker Setup...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('   Please copy .env.example to .env and configure your settings');
  process.exit(1);
}

// Check package.json dependencies
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredDeps = ['firebase', 'react-native-maps', 'expo-location'];
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
  console.log('❌ Missing dependencies:', missingDeps.join(', '));
  console.log('   Run: npm install');
  process.exit(1);
}

// Check TypeScript configuration
const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
if (!fs.existsSync(tsConfigPath)) {
  console.log('❌ TypeScript configuration not found');
  process.exit(1);
}

// Check Firebase configuration
const firebaseConfigPath = path.join(__dirname, '..', 'src', 'config', 'firebase.ts');
if (!fs.existsSync(firebaseConfigPath)) {
  console.log('❌ Firebase configuration not found');
  process.exit(1);
}

// Check Mapbox configuration
const mapboxConfigPath = path.join(__dirname, '..', 'src', 'config', 'mapbox.ts');
if (!fs.existsSync(mapboxConfigPath)) {
  console.log('❌ Mapbox configuration not found');
  process.exit(1);
}

console.log('✅ All configurations validated successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Configure your .env file with Firebase and Mapbox credentials');
console.log('2. Start the development server: npm start');
console.log('3. Test the app on your device or simulator');
console.log('\n🚀 Ready to track Spartan races!');
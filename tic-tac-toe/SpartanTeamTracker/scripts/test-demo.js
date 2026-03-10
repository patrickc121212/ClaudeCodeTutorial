#!/usr/bin/env node

// Simple demo test script that validates the app structure without running Jest

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Spartan Team Tracker Demo Setup...\n');

// Check critical files exist
const criticalFiles = [
  'App.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/RaceScreen.tsx',
  'src/screens/TeamScreen.tsx',
  'src/screens/AnalyticsScreen.tsx',
  'src/services/MockFirebaseService.ts',
  'src/services/MockLocationService.ts',
  'src/utils/DemoData.ts',
  'src/store/store.ts',
  'src/store/raceSlice.ts',
  'src/store/teamSlice.ts',
  'src/store/locationSlice.ts',
];

let allFilesExist = true;

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json for required dependencies
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredDeps = ['react', 'react-native', 'expo', '@reduxjs/toolkit', 'react-redux'];
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length === 0) {
  console.log('\n✅ All required dependencies are installed');
} else {
  console.log(`\n❌ Missing dependencies: ${missingDeps.join(', ')}`);
  allFilesExist = false;
}

// Check TypeScript configuration
const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  console.log('✅ TypeScript configuration found');
} else {
  console.log('❌ TypeScript configuration missing');
  allFilesExist = false;
}

// Check babel configuration
const babelConfigPath = path.join(__dirname, '..', 'babel.config.js');
if (fs.existsSync(babelConfigPath)) {
  console.log('✅ Babel configuration found');
} else {
  console.log('❌ Babel configuration missing');
  allFilesExist = false;
}

// Check mock services are properly set up
const appContent = fs.readFileSync(path.join(__dirname, '..', 'App.tsx'), 'utf8');
if (appContent.includes('MockServicesInitializer')) {
  console.log('✅ Mock services integration found in App.tsx');
} else {
  console.log('❌ Mock services not integrated in App.tsx');
  allFilesExist = false;
}

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 Demo setup validation PASSED!');
  console.log('\n🚀 Ready to start the demo:');
  console.log('1. Run: npm start');
  console.log('2. Use Expo Go app on your phone');
  console.log('3. Test the app functionality');
  console.log('\n📱 The app will show:');
  console.log('   • Demo race "Spartan Sprint Demo"');
  console.log('   • Demo team "Spartan Warriors" with 4 members');
  console.log('   • Mock location tracking');
  console.log('   • Performance analytics');
} else {
  console.log('❌ Demo setup validation FAILED');
  console.log('Please check the missing files/dependencies above');
  process.exit(1);
}

console.log('\n💡 Next steps:');
console.log('• Configure Firebase/Mapbox for real functionality');
console.log('• Test the app thoroughly');
console.log('• Deploy to app stores when ready');
# Setup Guide - Firebase and Mapbox Configuration

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `spartan-team-tracker`
4. Follow the setup wizard

### 2. Enable Realtime Database
1. In your Firebase project, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Register app name: `spartan-team-tracker-web`
5. Copy the configuration object

### 4. Configure Environment Variables
Create a `.env` file in the project root:

```env
# Firebase Configuration
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=spartan-team-tracker.firebaseapp.com
FIREBASE_DATABASE_URL=https://spartan-team-tracker-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=spartan-team-tracker
FIREBASE_STORAGE_BUCKET=spartan-team-tracker.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Mapbox Configuration
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

# App Configuration
NODE_ENV=development
```

## Mapbox Setup

### 1. Create Mapbox Account
1. Go to [Mapbox](https://www.mapbox.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Access Token
1. Go to your Mapbox account dashboard
2. Click "Access tokens"
3. Copy your default public token
4. (Optional) Create a new token for your app

### 3. Configure Mapbox
1. Add your Mapbox token to the `.env` file
2. The app will use Mapbox styles for better map rendering

## Testing the Setup

### 1. Start Development Server
```bash
npm start
```

### 2. Test Firebase Connection
1. Open the app
2. Try creating a team
3. Check Firebase console for data

### 3. Test Map Integration
1. Navigate to the Race screen
2. Verify map loads correctly
3. Check that location tracking works

## Production Deployment

### 1. Firebase Security Rules
Update your Realtime Database rules:

```json
{
  "rules": {
    "races": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "teams": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "members": {
      ".read": "auth != null",
      ".write": "auth.uid == $memberId"
    }
  }
}
```

### 2. Environment Configuration
For production, use separate environment variables:

```env
# Production Firebase Configuration
FIREBASE_API_KEY=your-production-api-key
FIREBASE_AUTH_DOMAIN=spartan-team-tracker-prod.firebaseapp.com
FIREBASE_DATABASE_URL=https://spartan-team-tracker-prod-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=spartan-team-tracker-prod

# Production Mapbox Configuration
MAPBOX_ACCESS_TOKEN=your-production-mapbox-token

NODE_ENV=production
```

### 3. Build for Production
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Troubleshooting

### Common Issues

#### Firebase Connection Issues
- Verify Firebase project is created
- Check environment variables are set correctly
- Ensure Realtime Database is enabled

#### Map Loading Issues
- Verify Mapbox token is valid
- Check internet connection
- Verify location permissions are granted

#### Environment Variables Not Loading
- Restart Expo development server
- Check `.env` file is in project root
- Verify variable names match exactly

### Debug Mode
Enable debug logging by setting:

```env
NODE_ENV=development
DEBUG=true
```

This will show detailed logs for Firebase and Mapbox operations.

## Next Steps

After successful setup:
1. Test team creation and member tracking
2. Verify real-time location updates
3. Test race timing and analytics
4. Deploy to App Store/Google Play

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure Firebase project is properly configured
4. Check Mapbox token permissions

For additional help, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Mapbox Documentation](https://docs.mapbox.com)
- [Expo Documentation](https://docs.expo.dev)
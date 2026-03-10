# Spartan Team Tracker

A cross-platform mobile application built with React Native and Expo for tracking team members during Spartan obstacle course races.

## Features

### Core Features
- **High-Accuracy GPS Tracking**: Real-time location tracking with 1-10 meter accuracy
- **Team Coordination**: Monitor team member positions and status during races
- **Performance Analytics**: Pace calculation, projected finish times, and performance metrics
- **Race Management**: Support for all Spartan race types (Sprint, Super, Beast, Ultra)
- **Safety Monitoring**: Team member status tracking and emergency alerts

### Race Types Supported
- **Sprint**: 5km with 20+ obstacles
- **Super**: 13km with 25+ obstacles
- **Beast**: 21km with 30+ obstacles
- **Ultra**: 42km with 60+ obstacles (with transition points)

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Mapping**: React Native Maps
- **Location Services**: Expo Location API
- **Real-time Sync**: Firebase Realtime Database
- **Authentication**: Firebase Auth

## Project Structure

```
SpartanTeamTracker/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens (Home, Race, Team, Analytics)
│   ├── services/       # Location, Firebase, analytics services
│   ├── store/          # Redux state management
│   ├── utils/          # Pace calculation, GPS accuracy utilities
│   └── types/          # TypeScript type definitions
├── assets/             # Images, icons, splash screens
├── config/             # App configuration
└── docs/               # Documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platform:
```bash
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## Development Phases

### Phase 1: Foundation Setup ✅
- [x] React Native Expo project setup
- [x] TypeScript configuration
- [x] Redux store and state management
- [x] Basic navigation structure
- [x] Core screens (Home, Race, Team, Analytics)

### Phase 2: Core Location Services (In Progress)
- [ ] GPS tracking implementation
- [ ] Background location services
- [ ] Map integration
- [ ] Battery optimization

### Phase 3: Team Coordination
- [ ] Real-time location synchronization
- [ ] Team member tracking on maps
- [ ] Communication features
- [ ] Safety monitoring

### Phase 4: Performance Analytics
- [ ] Pace calculation algorithms
- [ ] Projected completion time models
- [ ] Performance history tracking
- [ ] Advanced analytics dashboard

### Phase 5: Race Lifecycle Integration
- [ ] Pre-race preparation features
- [ ] During-race monitoring
- [ ] Post-race analysis
- [ ] Spartan-specific race support

## Key Components

### State Management
- **Race State**: Race configuration, status, timing
- **Team State**: Team members, locations, status
- **Location State**: GPS tracking, accuracy, background services

### Utilities
- **PaceCalculator**: Performance metrics and projections
- **GPSAccuracy**: Location validation and optimization
- **RaceProjections**: Finish time predictions and analysis

### Services
- **LocationService**: GPS tracking and background processing
- **FirebaseService**: Real-time team synchronization
- **AnalyticsService**: Performance tracking and insights

## Testing Strategy

### Unit Testing
- Business logic validation
- Pace calculation accuracy
- GPS accuracy algorithms

### Integration Testing
- Component interaction testing
- Redux state management
- Navigation flow testing

### Field Testing
- Real-world GPS accuracy validation
- Battery performance testing
- Team synchronization reliability

## Performance Targets

- **GPS Accuracy**: 90%+ readings within 10m accuracy
- **Battery Life**: <15% drain per hour during active tracking
- **Sync Reliability**: 99%+ successful location updates
- **Response Time**: <2 seconds for location updates

## Security & Privacy

- Location data only shared with team members
- Granular privacy controls
- End-to-end encryption for sensitive data
- GDPR compliance for European users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the code examples in `/src`

## Roadmap

### Version 1.0 (MVP)
- Basic GPS tracking and team coordination
- Performance analytics for individual races
- Support for all Spartan race types

### Version 2.0
- Advanced analytics and insights
- Historical performance tracking
- Custom race course creation
- Integration with Spartan official APIs

### Version 3.0
- Multi-language support
- Advanced safety features
- Integration with fitness trackers
- Community features and race sharing
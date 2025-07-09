# React Native Setup Guide - Parmanand Sports Academy

## Prerequisites

### 1. Development Environment Setup

#### For Windows/macOS/Linux:
```bash
# Install Node.js (18 or higher)
# Install React Native CLI
npm install -g @react-native-community/cli

# For Android development
# Install Android Studio and Android SDK
# Set ANDROID_HOME environment variable

# For iOS development (macOS only)
# Install Xcode from App Store
# Install CocoaPods: sudo gem install cocoapods
```

#### Expo Alternative (Recommended for beginners):
```bash
npm install -g @expo/cli
```

## Project Setup

### Option 1: Expo (Easier, recommended)
```bash
npx create-expo-app ParmanandSportsAcademy --template
cd ParmanandSportsAcademy

# Install dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @react-navigation/stack @react-navigation/drawer
npm install react-native-screens react-native-safe-area-context
npm install @tanstack/react-query axios
npm install react-hook-form @hookform/resolvers
npm install zod date-fns
npm install expo-secure-store expo-constants
npx expo install react-native-svg
```

### Option 2: React Native CLI (More control)
```bash
npx react-native init ParmanandSportsAcademy
cd ParmanandSportsAcademy

# Install navigation
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context
npx pod-install # iOS only

# Install other dependencies
npm install @tanstack/react-query axios
npm install react-hook-form @hookform/resolvers
npm install zod date-fns
npm install react-native-keychain # for secure storage
npm install react-native-svg
```

## File Structure

```
ParmanandSportsAcademy/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── forms/        # Form components
│   │   └── charts/       # Chart components
│   ├── screens/
│   │   ├── coach/        # Coach app screens
│   │   ├── student/      # Student app screens
│   │   └── auth/         # Authentication screens
│   ├── navigation/
│   │   ├── CoachNavigator.tsx
│   │   ├── StudentNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── services/
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Authentication service
│   │   └── storage.ts    # Local storage service
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── constants/        # App constants
├── assets/               # Images, fonts, etc.
└── App.tsx              # Main app component
```

## Key Differences from Web Version

### 1. Navigation
- Replace `wouter` with `@react-navigation/native`
- Use `createBottomTabNavigator` for bottom navigation
- Use `createStackNavigator` for screen navigation

### 2. UI Components
- Replace `shadcn/ui` components with React Native equivalents
- Use `react-native-elements` or `native-base` for UI components
- Custom styling with StyleSheet

### 3. Storage
- Replace `localStorage` with `@react-native-async-storage/async-storage`
- Use `react-native-keychain` for secure token storage

### 4. API Integration
- Same backend APIs can be used
- Replace `fetch` with `axios` for better error handling
- Add proper error boundaries

## API Integration

The existing backend at `http://your-domain.com/api` can be used directly:

```typescript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://your-replit-app.replit.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('mobile-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Component Migration Examples

### Button Component (Web → React Native)
```tsx
// Web version (shadcn/ui)
<Button className="w-full" onClick={handlePress}>
  Click me
</Button>

// React Native version
<TouchableOpacity style={styles.button} onPress={handlePress}>
  <Text style={styles.buttonText}>Click me</Text>
</TouchableOpacity>
```

### Card Component (Web → React Native)
```tsx
// Web version
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// React Native version
<View style={styles.card}>
  <View style={styles.cardHeader}>
    <Text style={styles.cardTitle}>Title</Text>
  </View>
  <View style={styles.cardContent}>
    <Text>Content</Text>
  </View>
</View>
```

## Development Workflow

### 1. Start Development Server
```bash
# Expo
npx expo start

# React Native CLI
npx react-native start
```

### 2. Run on Device/Simulator
```bash
# Expo
# Scan QR code with Expo Go app

# React Native CLI
npx react-native run-android
npx react-native run-ios
```

### 3. Building for Production
```bash
# Expo
eas build --platform all

# React Native CLI
cd android && ./gradlew assembleRelease  # Android
npx react-native run-ios --configuration Release  # iOS
```

## Next Steps

1. Set up development environment
2. Create new React Native project
3. Migrate authentication system
4. Convert UI components
5. Implement navigation
6. Add API integration
7. Test on physical devices
8. Build and deploy to app stores

## Ready-to-Convert Components

All the following components from the current web app are ready for React Native conversion:

- ✅ Authentication system
- ✅ Coach dashboard and features
- ✅ Student dashboard and features
- ✅ API integration layer
- ✅ Data models and types
- ✅ Business logic functions

The backend APIs are fully functional and ready to support the React Native apps immediately.
# React Native Firebase Setup Guide

## 🔥 Firebase Configuration Complete

Your React Native apps are now configured with Firebase authentication and real-time database capabilities.

## 📱 App Configuration

### iOS App (Student App)
- **Bundle ID**: `com.psa.user`
- **App ID**: `1:610461935332:ios:52d75f30f8f949ab196ef1`
- **Config File**: `GoogleService-Info.plist`

### Android Apps
1. **Coach App**: `com.psa.coatch`
   - **App ID**: `1:610461935332:android:cffd908cfb9223a1196ef1`
   
2. **Student App**: `com.psanashik.user`
   - **App ID**: `1:610461935332:android:71f9b8cb8d3b64a0196ef1`

### Common Configuration
- **Project ID**: `psa-nashik-app`
- **Storage Bucket**: `psa-nashik-app.firebasestorage.app`
- **Sender ID**: `610461935332`

## 🚀 React Native Project Setup

### Step 1: Create React Native Projects

```bash
# Create Coach App
npx react-native init PSACoachApp
cd PSACoachApp

# Create Student App
npx react-native init PSAStudentApp
cd PSAStudentApp
```

### Step 2: Install Firebase Dependencies

```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/messaging
```

### Step 3: Configure Firebase Files

#### For iOS:
1. Copy `GoogleService-Info.plist` to `ios/` folder
2. Add to Xcode project
3. Enable Phone Authentication in Firebase Console

#### For Android:
1. Copy `google-services.json` to `android/app/` folder
2. Update `android/build.gradle`:
   ```gradle
   classpath 'com.google.gms:google-services:4.3.15'
   ```
3. Update `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

### Step 4: Configure App Package Names

#### Coach App (`com.psa.coatch`):
- Update `android/app/src/main/AndroidManifest.xml`
- Update `android/app/build.gradle` applicationId

#### Student App (`com.psanashik.user`):
- Update `android/app/src/main/AndroidManifest.xml`
- Update `android/app/build.gradle` applicationId

## 📲 Available Components

### Pre-built React Native Components:
- ✅ `AuthService.ts` - Authentication service
- ✅ `LoginScreen.tsx` - Login interface
- ✅ `CoachDashboard.tsx` - Coach dashboard
- ✅ `StudentDashboard.tsx` - Student dashboard
- ✅ `Navigation.tsx` - App navigation
- ✅ `SplashScreen.tsx` - App splash screen
- ✅ `App.tsx` - Main app component
- ✅ `api.ts` - API integration

### Features Included:
- 🔐 Phone number authentication
- 📊 Real-time dashboard updates
- 📱 Native navigation
- 🔄 Automatic session management
- 📞 Direct API integration with backend

## 🛠️ Development Workflow

### 1. Copy Components
```bash
# Copy all React Native components to your project
cp -r react-native-components/* /path/to/your/react-native-project/src/
```

### 2. Update Firebase Config
- Components already configured with your Firebase keys
- No additional setup needed

### 3. Test Authentication
```bash
# Run the app
npx react-native run-android
# or
npx react-native run-ios
```

## 🔧 Key Features

### Authentication Flow:
1. **Phone Input**: Student/Coach enters phone number
2. **OTP Verification**: Firebase sends SMS verification
3. **Auto Login**: Automatic session management
4. **Role Detection**: Identifies coach vs student automatically

### Dashboard Features:
- **Coach Dashboard**: Class management, attendance, student overview
- **Student Dashboard**: Schedule, attendance, achievements, payments

### Real-time Updates:
- Live dashboard data synchronization
- Instant notification updates
- Automatic content refresh

## 📱 Testing Instructions

### 1. Install and Run
```bash
# Install dependencies
npm install

# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios
```

### 2. Test Authentication
- Enter a valid phone number
- Receive SMS OTP
- Verify and login
- Access dashboard features

### 3. Test Backend Integration
- All API endpoints are pre-configured
- Real-time data synchronization
- Automatic error handling

## 🎯 Production Deployment

### Android (Google Play Store):
1. Build signed APK
2. Upload to Play Console
3. Configure app details
4. Release to production

### iOS (App Store):
1. Configure signing certificates
2. Build archive in Xcode
3. Upload to App Store Connect
4. Submit for review

## 📊 Analytics & Monitoring

### Firebase Console:
- Authentication metrics
- User engagement analytics
- Crash reporting
- Performance monitoring

### Custom Analytics:
- Student registration tracking
- Coach activity monitoring
- Payment transaction logging
- Attendance pattern analysis

## 🔒 Security Features

### Authentication Security:
- SMS OTP verification
- Secure token storage
- Automatic session refresh
- Logout on suspicious activity

### Data Security:
- Encrypted local storage
- Secure API communication
- Role-based access control
- Data validation and sanitization

## 📋 Next Steps

1. **Create React Native Projects**: Set up separate projects for coach and student apps
2. **Copy Components**: Use the pre-built components in your projects
3. **Configure Firebase**: Add the configuration files to your projects
4. **Test Authentication**: Verify phone number authentication works
5. **Deploy to Stores**: Build and release native apps

Your React Native mobile apps are ready to build with complete Firebase integration! 🚀

## 🆘 Support

For React Native development support:
- React Native Documentation: https://reactnative.dev/docs/getting-started
- Firebase for React Native: https://rnfirebase.io/
- Project-specific issues: Check the pre-built components for examples

The complete mobile app infrastructure is now ready for native development! 📱
# Firebase OTP Authentication Setup Guide

## Firebase Console Configuration

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and create new project: "Parmanand Sports Academy"
3. Enable Google Analytics (optional)

### Step 2: Enable Phone Authentication
1. In Firebase console, go to **Authentication** > **Sign-in method**
2. Enable **Phone** sign-in provider
3. Add your app's authorized domains:
   - `localhost` (for development)
   - Your production domain
   - Your Replit app domain

### Step 3: Get Configuration Keys
1. Go to **Project Settings** > **General**
2. Under "Your apps", click **Web app** icon
3. Register app name: "Sports Academy Web"
4. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Step 4: Required Environment Variables
Add these to your environment:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID` 
- `VITE_FIREBASE_APP_ID`

## Implementation Overview

The system will include:
1. **Phone OTP Verification** - Firebase Auth
2. **Student Registration Flow** - Multi-step form
3. **Sport & Batch Selection** - Dynamic options
4. **Payment Integration** - Registration fee
5. **Account Creation** - Complete profile setup
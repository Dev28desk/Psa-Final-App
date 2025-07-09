// Firebase configuration for React Native apps
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBu6-8FLc1eGaaBeetVyvBcEX5AoL1xGqQ',
  authDomain: 'psa-nashik-app.firebaseapp.com',
  projectId: 'psa-nashik-app',
  storageBucket: 'psa-nashik-app.firebasestorage.app',
  messagingSenderId: '610461935332',
  appId: '1:610461935332:web:ed897ed463933072196ef1',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore for use in components
export { auth, firestore };
export default app;
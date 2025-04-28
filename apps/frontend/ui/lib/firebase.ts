// Import the Firebase functions
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0ELKSyXrMIVsfOP7majX7suf1hvmfqAM",
  authDomain: "aqmatic-e5022.firebaseapp.com",
  projectId: "aqmatic-e5022",
  storageBucket: "aqmatic-e5022.firebasestorage.app",
  messagingSenderId: "505688614052",
  appId: "1:505688614052:web:b0fde0ee517a483e437231",
  measurementId: "G-Z8PNRMC3V4"
};

// Initialize Firebase - ensure we only initialize once
let firebaseApp: FirebaseApp;
let analytics: Analytics | undefined;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  // Only initialize analytics in the browser
  if (typeof window !== 'undefined') {
    isSupported().then(yes => yes && (analytics = getAnalytics(firebaseApp)));
  }
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase Auth
const auth = getAuth(firebaseApp);

// If in development mode, connect to auth emulator (optional)
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export { auth, firebaseApp, analytics }; 
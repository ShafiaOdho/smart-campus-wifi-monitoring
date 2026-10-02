import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const defaultEnvConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isConfigured = false;

export function initFirebase(customConfig?: Partial<FirebaseConfig>) {
  const config = { ...defaultEnvConfig, ...customConfig };
  
  if (config.apiKey && config.projectId) {
    try {
      if (!getApps().length) {
        app = initializeApp(config);
      } else {
        app = getApps()[0];
      }
      db = getFirestore(app);
      auth = getAuth(app);
      isConfigured = true;
      console.log('Firebase initialized successfully with live cloud services.');
    } catch (e) {
      console.warn('Firebase initialization notice: using offline resilient storage.', e);
      isConfigured = false;
    }
  } else {
    isConfigured = false;
  }

  return { app, db, auth, isConfigured };
}

// Initial setup
initFirebase();

export { app, db, auth, isConfigured };

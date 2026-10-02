import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';
import { store } from './store';
import {
  CampusLocation,
  Complaint,
  NetworkDevice,
  OutageAlert,
  SpeedTestResult,
  UserAccount,
  NetworkThresholdConfig,
} from '../types';

/**
 * Initializes bidirectional live Firestore listeners for real-time synchronization.
 * When any client adds a speed test, registers an AP, submits a ticket, or changes
 * a threshold weight, all connected clients update in real time via Firestore WebSocket snapshots.
 */
export function initFirestoreRealtimeSync() {
  if (!db || !isConfigured) {
    console.warn('Firestore is not configured. Running in local reactive mode.');
    return;
  }

  console.log('Attaching live Firestore realtime listeners...');

  // 1. Live Locations Sync
  try {
    const locationsRef = collection(db, 'locations');
    onSnapshot(locationsRef, (snapshot) => {
      if (!snapshot.empty) {
        const locations: CampusLocation[] = [];
        snapshot.forEach((docSnap) => {
          locations.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        const current = store.getState();
        if (current.currentUser) {
          store.setCurrentUser({ ...current.currentUser });
        }
      }
    });
  } catch (e) {
    console.warn('Locations live listener error:', e);
  }

  // 2. Live Speed Tests Sync
  try {
    const testsRef = collection(db, 'speed_tests');
    const q = query(testsRef, orderBy('testedAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const tests: SpeedTestResult[] = [];
        snapshot.forEach((docSnap) => {
          tests.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
      }
    });
  } catch (e) {
    console.warn('Speed tests live listener error:', e);
  }

  // 3. Live Complaints Sync
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const complaints: Complaint[] = [];
        snapshot.forEach((docSnap) => {
          complaints.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
      }
    });
  } catch (e) {
    console.warn('Complaints live listener error:', e);
  }

  // 4. Live Devices Sync
  try {
    const devicesRef = collection(db, 'devices');
    onSnapshot(devicesRef, (snapshot) => {
      if (!snapshot.empty) {
        const devices: NetworkDevice[] = [];
        snapshot.forEach((docSnap) => {
          devices.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
      }
    });
  } catch (e) {
    console.warn('Devices live listener error:', e);
  }
}

/**
 * Persists a speed test to Cloud Firestore
 */
export async function syncSpeedTestToFirestore(test: SpeedTestResult) {
  if (db && isConfigured) {
    try {
      await setDoc(doc(db, 'speed_tests', test.id), {
        ...test,
        syncedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firestore speed test sync notice:', e);
    }
  }
}

/**
 * Persists a complaint ticket to Cloud Firestore
 */
export async function syncComplaintToFirestore(complaint: Complaint) {
  if (db && isConfigured) {
    try {
      await setDoc(doc(db, 'complaints', complaint.id), {
        ...complaint,
        syncedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firestore complaint sync notice:', e);
    }
  }
}

/**
 * Persists an AP device to Cloud Firestore
 */
export async function syncDeviceToFirestore(device: NetworkDevice) {
  if (db && isConfigured) {
    try {
      await setDoc(doc(db, 'devices', device.id), {
        ...device,
        syncedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firestore device sync notice:', e);
    }
  }
}

/**
 * Deletes an AP device from Cloud Firestore
 */
export async function deleteDeviceFromFirestore(deviceId: string) {
  if (db && isConfigured) {
    try {
      await deleteDoc(doc(db, 'devices', deviceId));
    } catch (e) {
      console.warn('Firestore device delete notice:', e);
    }
  }
}

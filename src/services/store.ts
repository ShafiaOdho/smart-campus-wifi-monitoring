import { useState, useEffect } from 'react';
import {
  CampusLocation,
  Complaint,
  ComplaintStatus,
  HealthStatus,
  NetworkDevice,
  NetworkThresholdConfig,
  OutageAlert,
  SpeedTestResult,
  StaffNoteNotification,
  UserAccount,
  UserRole,
} from '../types';
import {
  INITIAL_COMPLAINTS,
  INITIAL_DEVICES,
  INITIAL_LOCATIONS,
  INITIAL_OUTAGES,
  INITIAL_SPEED_TESTS,
  INITIAL_USERS,
} from './mockDataSeeder';
import { DEFAULT_THRESHOLDS, calculateHealthScore } from './healthScoreEngine';
import { detectNetworkAnomalies, predictOutagesAndProblemLocations } from './aiAnalyticsEngine';

export const INITIAL_STAFF_NOTE_NOTIFICATIONS: StaffNoteNotification[] = [
  {
    id: 'note-notif-1',
    complaintId: 'tkt-2026-081',
    ticketNumber: 'tkt-2026-081',
    locationName: 'Library Floor 2 (Quiet Study)',
    author: 'Jordan Hayes',
    text: 'Inspected North AP-04 radio power and checking switch port errors on Floor 2 rack.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
  },
  {
    id: 'note-notif-2',
    complaintId: 'tkt-2026-080',
    ticketNumber: 'tkt-2026-080',
    locationName: 'Hostel Block C (Undergrad Dorms)',
    author: 'Jordan Hayes',
    text: 'Identified evening channel congestion on 2.4GHz band. Scheduled band-steering optimization.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isRead: false,
  },
  {
    id: 'note-notif-3',
    complaintId: 'tkt-2026-079',
    ticketNumber: 'tkt-2026-079',
    locationName: 'Computer Lab 1 (AI & Cloud Systems)',
    author: 'Jordan Hayes',
    text: 'Rebooted PoE switch stack core-sw-01. All 4 APs returned to healthy status.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    statusChange: 'Resolved',
    isRead: true,
  },
];

interface AppState {
  currentRole: UserRole;
  currentUser: UserAccount | null;
  users: UserAccount[];
  devices: NetworkDevice[];
  locations: CampusLocation[];
  speedTests: SpeedTestResult[];
  complaints: Complaint[];
  outages: OutageAlert[];
  staffNoteNotifications: StaffNoteNotification[];
  thresholds: NetworkThresholdConfig;
  selectedLocationId: string;
}

const STORAGE_KEY = 'smart_campus_wifi_state_v5';

function loadInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        currentUser: parsed.currentUser || null,
        users: parsed.users || INITIAL_USERS,
        devices: parsed.devices || INITIAL_DEVICES,
        staffNoteNotifications: parsed.staffNoteNotifications || INITIAL_STAFF_NOTE_NOTIFICATIONS,
        thresholds: { ...DEFAULT_THRESHOLDS, ...(parsed.thresholds || {}) },
      };
    }
  } catch (e) {
    console.error('Failed to load local storage state:', e);
  }

  return {
    currentRole: 'student',
    currentUser: null, // Starts on Login Page for all visitors!
    users: INITIAL_USERS,
    devices: INITIAL_DEVICES,
    locations: INITIAL_LOCATIONS,
    speedTests: INITIAL_SPEED_TESTS,
    complaints: INITIAL_COMPLAINTS,
    outages: INITIAL_OUTAGES,
    staffNoteNotifications: INITIAL_STAFF_NOTE_NOTIFICATIONS,
    thresholds: DEFAULT_THRESHOLDS,
    selectedLocationId: INITIAL_LOCATIONS[1].id,
  };
}

let globalState: AppState = loadInitialState();
const listeners = new Set<() => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
  listeners.forEach((listener) => listener());
}

export const store = {
  getState: () => globalState,

  // Role & User
  setRole: (role: UserRole) => {
    globalState = {
      ...globalState,
      currentRole: role,
      currentUser: globalState.currentUser
        ? { ...globalState.currentUser, role }
        : null,
    };
    notify();
  },

  setCurrentUser: (user: UserAccount | null) => {
    globalState = {
      ...globalState,
      currentUser: user,
      currentRole: user ? user.role : 'student',
    };
    notify();
  },

  setSelectedLocationId: (locationId: string) => {
    globalState = { ...globalState, selectedLocationId: locationId };
    notify();
  },

  // Speed Test Management
  addSpeedTest: (test: SpeedTestResult) => {
    const updatedTests = [test, ...globalState.speedTests];

    const updatedLocations = globalState.locations.map((loc) => {
      if (loc.id === test.locationId) {
        const locTests = updatedTests.filter((t) => t.locationId === loc.id);
        const avgDl = Number(
          (locTests.reduce((acc, t) => acc + t.downloadSpeed, 0) / locTests.length).toFixed(1)
        );
        const avgUl = Number(
          (locTests.reduce((acc, t) => acc + t.uploadSpeed, 0) / locTests.length).toFixed(1)
        );
        const avgP = Math.round(
          locTests.reduce((acc, t) => acc + t.ping, 0) / locTests.length
        );
        const loss = Number(
          (locTests.reduce((acc, t) => acc + t.packetLoss, 0) / locTests.length).toFixed(1)
        );

        const health = calculateHealthScore(
          { downloadSpeed: avgDl, uploadSpeed: avgUl, ping: avgP, packetLoss: loss },
          globalState.thresholds
        );

        return {
          ...loc,
          avgDownload: avgDl,
          avgUpload: avgUl,
          avgPing: avgP,
          packetLoss: loss,
          totalTests: locTests.length,
          currentHealthScore: health.score,
          currentStatus: health.status,
        };
      }
      return loc;
    });

    globalState = {
      ...globalState,
      speedTests: updatedTests,
      locations: updatedLocations,
    };
    notify();
  },

  // Complaint Management
  submitComplaint: (complaintData: Omit<Complaint, 'id' | 'createdAt' | 'status' | 'itNotes'>) => {
    const newComplaint: Complaint = {
      ...complaintData,
      id: `tkt-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      status: 'Submitted',
      itNotes: [],
      createdAt: new Date().toISOString(),
    };

    const updatedComplaints = [newComplaint, ...globalState.complaints];

    // Update location open complaints count
    const updatedLocations = globalState.locations.map((loc) => {
      if (loc.id === complaintData.locationId) {
        return {
          ...loc,
          openComplaints: loc.openComplaints + 1,
        };
      }
      return loc;
    });

    globalState = {
      ...globalState,
      complaints: updatedComplaints,
      locations: updatedLocations,
    };
    notify();
  },

  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, staffName: string, noteText?: string) => {
    let resolvedDelta = 0;
    let targetLocId = '';
    let targetLocName = 'Campus Location';

    const updatedComplaints = globalState.complaints.map((c) => {
      if (c.id === complaintId) {
        targetLocId = c.locationId;
        targetLocName = c.locationName;
        const isNowResolved = status === 'Resolved';
        const wasResolved = c.status === 'Resolved';

        if (isNowResolved && !wasResolved) resolvedDelta = 1;
        if (!isNowResolved && wasResolved) resolvedDelta = -1;

        const newNotes = noteText
          ? [
              ...c.itNotes,
              {
                id: `note-${Date.now()}`,
                author: staffName,
                text: noteText,
                timestamp: new Date().toISOString(),
                statusChange: status,
              },
            ]
          : c.itNotes;

        return {
          ...c,
          status,
          assignedStaff: staffName,
          resolvedAt: isNowResolved ? new Date().toISOString() : c.resolvedAt,
          itNotes: newNotes,
        };
      }
      return c;
    });

    const updatedLocations = globalState.locations.map((loc) => {
      if (loc.id === targetLocId && resolvedDelta !== 0) {
        return {
          ...loc,
          openComplaints: Math.max(0, loc.openComplaints - resolvedDelta),
          resolvedComplaints: loc.resolvedComplaints + resolvedDelta,
        };
      }
      return loc;
    });

    let updatedStaffNoteNotifications = globalState.staffNoteNotifications || [];
    if (noteText) {
      const newNotif: StaffNoteNotification = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        complaintId,
        ticketNumber: complaintId,
        locationName: targetLocName,
        author: staffName,
        text: noteText,
        timestamp: new Date().toISOString(),
        statusChange: status,
        isRead: false,
      };
      updatedStaffNoteNotifications = [newNotif, ...updatedStaffNoteNotifications];
    }

    globalState = {
      ...globalState,
      complaints: updatedComplaints,
      locations: updatedLocations,
      staffNoteNotifications: updatedStaffNoteNotifications,
    };
    notify();
  },

  addITNote: (complaintId: string, text: string) => {
    let targetLocName = 'Campus Location';
    const staffAuthor = globalState.currentUser?.name || 'IT Support Staff';

    const updatedComplaints = globalState.complaints.map((c) => {
      if (c.id === complaintId) {
        targetLocName = c.locationName;
        return {
          ...c,
          itNotes: [
            ...c.itNotes,
            {
              id: `note-${Date.now()}`,
              author: staffAuthor,
              text,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
      return c;
    });

    const newNotif: StaffNoteNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      complaintId,
      ticketNumber: complaintId,
      locationName: targetLocName,
      author: staffAuthor,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    globalState = {
      ...globalState,
      complaints: updatedComplaints,
      staffNoteNotifications: [newNotif, ...(globalState.staffNoteNotifications || [])],
    };
    notify();
  },

  updateComplaintDescription: (complaintId: string, description: string) => {
    const updatedComplaints = globalState.complaints.map((c) =>
      c.id === complaintId ? { ...c, description } : c
    );
    globalState = { ...globalState, complaints: updatedComplaints };
    notify();
  },

  // Staff Note Notifications for Managers/Admins
  markNoteNotificationAsRead: (notificationId: string) => {
    const updated = (globalState.staffNoteNotifications || []).map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    globalState = { ...globalState, staffNoteNotifications: updated };
    notify();
  },

  markAllNoteNotificationsAsRead: () => {
    const updated = (globalState.staffNoteNotifications || []).map((n) => ({
      ...n,
      isRead: true,
    }));
    globalState = { ...globalState, staffNoteNotifications: updated };
    notify();
  },

  clearNoteNotification: (notificationId: string) => {
    const updated = (globalState.staffNoteNotifications || []).filter((n) => n.id !== notificationId);
    globalState = { ...globalState, staffNoteNotifications: updated };
    notify();
  },

  // Outage Management
  resolveOutage: (outageId: string) => {
    const updatedOutages = globalState.outages.map((o) =>
      o.id === outageId ? { ...o, resolved: true } : o
    );
    globalState = { ...globalState, outages: updatedOutages };
    notify();
  },

  // AP Device CRUD
  addDevice: (deviceData: Omit<NetworkDevice, 'id' | 'lastSeen'>) => {
    const newDevice: NetworkDevice = {
      ...deviceData,
      id: `dev-ap-${Date.now().toString().slice(-4)}`,
      lastSeen: new Date().toISOString(),
    };
    globalState = { ...globalState, devices: [newDevice, ...globalState.devices] };
    notify();
  },

  updateDeviceStatus: (deviceId: string, status: 'Online' | 'Offline' | 'Degraded') => {
    const updatedDevices = globalState.devices.map((d) =>
      d.id === deviceId ? { ...d, status, lastSeen: new Date().toISOString() } : d
    );
    globalState = { ...globalState, devices: updatedDevices };
    notify();
  },

  deleteDevice: (deviceId: string) => {
    globalState = {
      ...globalState,
      devices: globalState.devices.filter((d) => d.id !== deviceId),
    };
    notify();
  },

  // Campus Location CRUD
  addLocation: (locationData: Omit<CampusLocation, 'id' | 'totalTests' | 'openComplaints' | 'resolvedComplaints'>) => {
    const newLoc: CampusLocation = {
      ...locationData,
      id: `loc-${Date.now().toString().slice(-4)}`,
      totalTests: 0,
      openComplaints: 0,
      resolvedComplaints: 0,
    };
    globalState = { ...globalState, locations: [...globalState.locations, newLoc] };
    notify();
  },

  updateLocation: (locationId: string, updates: Partial<CampusLocation>) => {
    const updatedLocations = globalState.locations.map((l) =>
      l.id === locationId ? { ...l, ...updates } : l
    );
    globalState = { ...globalState, locations: updatedLocations };
    notify();
  },

  deleteLocation: (locationId: string) => {
    globalState = {
      ...globalState,
      locations: globalState.locations.filter((l) => l.id !== locationId),
    };
    notify();
  },

  // User Management
  addUser: (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: `user-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    globalState = { ...globalState, users: [...globalState.users, newUser] };
    notify();
  },

  updateUserDetails: (userId: string, updates: Partial<UserAccount>) => {
    const updatedUsers = globalState.users.map((u) =>
      u.id === userId ? { ...u, ...updates } : u
    );
    globalState = { ...globalState, users: updatedUsers };
    notify();
  },

  updateUserRole: (userId: string, role: UserRole) => {
    const updatedUsers = globalState.users.map((u) => (u.id === userId ? { ...u, role } : u));
    globalState = { ...globalState, users: updatedUsers };
    notify();
  },

  deleteUser: (userId: string) => {
    globalState = {
      ...globalState,
      users: globalState.users.filter((u) => u.id !== userId),
    };
    notify();
  },

  // Threshold Configuration
  updateThresholds: (thresholds: NetworkThresholdConfig) => {
    const updatedLocations = globalState.locations.map((loc) => {
      const health = calculateHealthScore(
        {
          downloadSpeed: loc.avgDownload,
          uploadSpeed: loc.avgUpload,
          ping: loc.avgPing,
          packetLoss: loc.packetLoss,
        },
        thresholds
      );
      return {
        ...loc,
        currentHealthScore: health.score,
        currentStatus: health.status,
      };
    });

    globalState = {
      ...globalState,
      thresholds,
      locations: updatedLocations,
    };
    notify();
  },

  // Clear dummy data and start clean real-time mode
  clearDummyDataAndStartLive: () => {
    const realUsers = globalState.users.filter(
      (u) => u.email === 'shafiaodho@gmail.com' || u.role === 'admin'
    );
    if (realUsers.length === 0) {
      realUsers.push(INITIAL_USERS[0]);
    }

    const cleanLocations = globalState.locations.map((loc) => ({
      ...loc,
      totalTests: 0,
      openComplaints: 0,
      resolvedComplaints: 0,
      currentStatus: 'Good' as const,
      currentHealthScore: 80,
    }));

    globalState = {
      ...globalState,
      users: realUsers,
      currentUser: realUsers[0],
      speedTests: [],
      complaints: [],
      outages: [],
      staffNoteNotifications: [],
      locations: cleanLocations,
    };
    notify();
  },

  // Reset to realistic sample data
  resetToSampleData: () => {
    globalState = {
      currentRole: 'admin',
      currentUser: INITIAL_USERS[0], // Shafia Odho (Admin)
      users: INITIAL_USERS,
      devices: INITIAL_DEVICES,
      locations: INITIAL_LOCATIONS,
      speedTests: INITIAL_SPEED_TESTS,
      complaints: INITIAL_COMPLAINTS,
      outages: INITIAL_OUTAGES,
      staffNoteNotifications: INITIAL_STAFF_NOTE_NOTIFICATIONS,
      thresholds: DEFAULT_THRESHOLDS,
      selectedLocationId: INITIAL_LOCATIONS[1].id,
    };
    notify();
  },
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(globalState);

  useEffect(() => {
    const listener = () => setState(globalState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const anomalies = detectNetworkAnomalies(state.locations, state.speedTests);
  const outagePredictions = predictOutagesAndProblemLocations(
    state.locations,
    state.complaints,
    state.speedTests
  );

  return {
    ...state,
    anomalies,
    outagePredictions,
    setRole: store.setRole,
    setCurrentUser: store.setCurrentUser,
    setSelectedLocationId: store.setSelectedLocationId,
    addSpeedTest: store.addSpeedTest,
    submitComplaint: store.submitComplaint,
    updateComplaintStatus: store.updateComplaintStatus,
    updateComplaintDescription: store.updateComplaintDescription,
    addITNote: store.addITNote,
    markNoteNotificationAsRead: store.markNoteNotificationAsRead,
    markAllNoteNotificationsAsRead: store.markAllNoteNotificationsAsRead,
    clearNoteNotification: store.clearNoteNotification,
    resolveOutage: store.resolveOutage,
    addDevice: store.addDevice,
    updateDeviceStatus: store.updateDeviceStatus,
    deleteDevice: store.deleteDevice,
    addLocation: store.addLocation,
    updateLocation: store.updateLocation,
    deleteLocation: store.deleteLocation,
    addUser: store.addUser,
    updateUserDetails: store.updateUserDetails,
    updateUserRole: store.updateUserRole,
    deleteUser: store.deleteUser,
    updateThresholds: store.updateThresholds,
    clearDummyDataAndStartLive: store.clearDummyDataAndStartLive,
    resetToSampleData: store.resetToSampleData,
  };
}
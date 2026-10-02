import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useAppStore } from './services/store';
import { auth, isConfigured } from './services/firebase';
import { Navbar } from './components/Navbar';
import { SpeedTestModal } from './components/SpeedTestModal';
import { ComplaintModal } from './components/ComplaintModal';
import { AuthModal } from './components/AuthModal';
import { StudentView } from './views/StudentView';
import { ITSupportView } from './views/ITSupportView';
import { NetworkManagerView } from './views/NetworkManagerView';
import { AdminView } from './views/AdminView';
import { AIInsightsView } from './views/AIInsightsView';
import { LoginPage } from './views/LoginPage';
import { SpeedTestResult, UserRole, UserAccount } from './types';
import { Wifi } from 'lucide-react';
import { MASTER_ADMIN_EMAILS } from './services/authService';
import { initFirestoreRealtimeSync } from './services/firestoreSync';

export const App: React.FC = () => {
  const { currentRole, currentUser, setCurrentUser, setRole, setSelectedLocationId } = useAppStore();

  const [currentTab, setCurrentTab] = useState<'overview' | 'role_view' | 'ai_insights'>('role_view');
  const [isSpeedTestOpen, setIsSpeedTestOpen] = useState<boolean>(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('student');
  const [complaintInitialSnapshot, setComplaintInitialSnapshot] = useState<SpeedTestResult | null>(null);

  // Initialize Firebase Auth state listener and Firestore Realtime Sync
  useEffect(() => {
    initFirestoreRealtimeSync();

    if (auth && isConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser && fbUser.email) {
          const cleanEmail = fbUser.email.toLowerCase();
          const isMasterAdmin = MASTER_ADMIN_EMAILS.includes(cleanEmail);

          let role: UserRole = 'student';
          if (isMasterAdmin || cleanEmail.includes('admin')) role = 'admin';
          else if (cleanEmail.includes('support') || cleanEmail.includes('staff')) role = 'it_staff';
          else if (cleanEmail.includes('manager') || cleanEmail.includes('engineer')) role = 'manager';

          const liveUser: UserAccount = {
            id: fbUser.uid,
            name: fbUser.displayName || (isMasterAdmin ? 'Shafia Odho (Admin)' : cleanEmail.split('@')[0]),
            email: cleanEmail,
            role,
            department: role === 'admin' ? 'Campus Network Directorate' : 'Computer Science',
            createdAt: new Date().toISOString(),
          };

          setCurrentUser(liveUser);
          setRole(role);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const handleOpenSpeedTest = (locationId?: string) => {
    if (locationId) setSelectedLocationId(locationId);
    setIsSpeedTestOpen(true);
  };

  const handleOpenComplaint = (snapshot?: SpeedTestResult | null, locationId?: string) => {
    if (locationId) setSelectedLocationId(locationId);
    setComplaintInitialSnapshot(snapshot || null);
    setIsComplaintOpen(true);
  };

  const handleOpenComplaintWithTest = (test: SpeedTestResult) => {
    setComplaintInitialSnapshot(test);
    setIsComplaintOpen(true);
  };

  const handleOpenAuth = (role: UserRole = 'student') => {
    setAuthInitialRole(role);
    setIsAuthOpen(true);
  };

  // If no user is logged in, present the dedicated full-screen LoginPage first
  if (!currentUser) {
    return <LoginPage />;
  }

  // Active role is strictly derived from the authenticated user's account role
  const activeRole: UserRole = currentUser.role || currentRole || 'student';

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-['Inter',sans-serif]">
      {/* Top Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSpeedTest={() => handleOpenSpeedTest()}
        onOpenComplaint={() => handleOpenComplaint()}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Container - Responsive layout fitting 100% of the screen without horizontal scroll */}
      <main className="flex-1 mx-auto w-full max-w-[1750px] px-3 sm:px-6 lg:px-8 py-6 space-y-8 overflow-x-hidden">
        {/* Role-Based Dedicated Views */}
        {currentTab === 'role_view' && (
          <div className="animate-in fade-in duration-200">
            {activeRole === 'student' && (
              <StudentView
                onOpenSpeedTest={() => handleOpenSpeedTest()}
                onOpenComplaint={(snapshot) => handleOpenComplaint(snapshot)}
              />
            )}
            {activeRole === 'it_staff' && <ITSupportView />}
            {activeRole === 'manager' && <NetworkManagerView />}
            {activeRole === 'admin' && <AdminView />}
          </div>
        )}

        {/* AI Intelligence Hub */}
        {currentTab === 'ai_insights' && <AIInsightsView />}
      </main>

      {/* Speed Test Modal */}
      <SpeedTestModal
        isOpen={isSpeedTestOpen}
        onClose={() => setIsSpeedTestOpen(false)}
        onOpenComplaintWithTest={handleOpenComplaintWithTest}
      />

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={isComplaintOpen}
        onClose={() => {
          setIsComplaintOpen(false);
          setComplaintInitialSnapshot(null);
        }}
        initialTestSnapshot={complaintInitialSnapshot}
      />

      {/* Authentication & Domain Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authInitialRole}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="mx-auto max-w-[1750px] px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Wifi className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Smart Campus Wi-Fi &amp; Network Health System</span>
          </div>
          <span className="font-medium text-xs sm:text-sm text-slate-500">
            Enterprise Wi-Fi Diagnostics, RBAC IT Ticketing &amp; AI Analytics &bull; Problem Solving Hackathon 2026
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;

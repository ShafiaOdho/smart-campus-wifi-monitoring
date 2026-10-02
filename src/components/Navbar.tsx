import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  LogIn,
  LogOut,
  RotateCcw,
  Shield,
  Sparkles,
  User,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../services/store';
import { UserRole } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { logoutUser } from '../services/authService';

interface NavbarProps {
  currentTab: 'overview' | 'role_view' | 'ai_insights';
  setCurrentTab: (tab: 'overview' | 'role_view' | 'ai_insights') => void;
  onOpenSpeedTest: () => void;
  onOpenComplaint: () => void;
  onOpenAuth: (role?: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSpeedTest,
  onOpenAuth,
}) => {
  const {
    currentRole,
    currentUser,
    setCurrentUser,
    setRole,
    outages,
    anomalies,
    staffNoteNotifications,
    resetToSampleData,
  } = useAppStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const activeOutages = outages.filter((o) => !o.resolved);
  const unreadNotesCount = (staffNoteNotifications || []).filter((n) => !n.isRead).length;
  const totalAlerts = activeOutages.length + anomalies.length + unreadNotesCount;

  const roleConfigs: Record<UserRole, { label: string; icon: React.ReactNode; badgeColor: string; description: string }> = {
    student: {
      label: 'Student / User Portal',
      icon: <User className="h-4 w-4" />,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Speed Benchmarks & IT Complaints',
    },
    it_staff: {
      label: 'IT Support Console',
      icon: <Wrench className="h-4 w-4" />,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Ticket Queue & Outage Resolution',
    },
    manager: {
      label: 'Network Engineering',
      icon: <Activity className="h-4 w-4" />,
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      description: 'Campus Analytics & AI Predictions',
    },
    admin: {
      label: 'Master Administration',
      icon: <Shield className="h-4 w-4" />,
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      description: 'Infrastructure, Staff Provisioning & RBAC',
    },
  };

  const isStaffOrAdmin = currentUser?.role === 'it_staff' || currentUser?.role === 'manager' || currentUser?.role === 'admin';
  const activeRoleConfig = roleConfigs[currentUser?.role || currentRole] || roleConfigs.student;

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setCurrentUser(null);
    setCurrentTab('role_view');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      {/* Active Campus Outage Ribbon - ONLY displayed to IT Support, Managers, and Admins */}
      {isStaffOrAdmin && activeOutages.length > 0 && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 sm:px-8 py-2 text-xs sm:text-sm text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-bold text-rose-800 uppercase tracking-wide text-[11px] bg-rose-100 px-2 py-0.5 rounded border border-rose-300 shrink-0">
              Internal Incident Notice
            </span>
            <span className="truncate font-medium text-xs sm:text-sm">
              {activeOutages[0].title} &bull; Affecting <strong className="text-rose-950">{activeOutages[0].locationName}</strong>
            </span>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="text-xs font-bold text-rose-700 underline hover:text-rose-950 shrink-0 ml-4"
          >
            Details ({activeOutages.length})
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="mx-auto flex max-w-[1750px] items-center justify-between px-4 sm:px-8 py-3.5 gap-4">
        {/* Left Branding & Hub Nav */}
        <div className="flex items-center gap-6 lg:gap-8 shrink-0">
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setCurrentTab('role_view')}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition-transform group-hover:scale-105 shrink-0">
              <Wifi className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 leading-none">
                <span className="text-lg font-black tracking-tight text-slate-900 whitespace-nowrap">
                  SmartCampus <span className="text-indigo-600">Wi-Fi</span>
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
                  Firebase Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 hidden md:block whitespace-nowrap">
                Network Health Diagnostics & IT Management
              </p>
            </div>
          </div>

          {/* Navigation links dynamically guarded according to user's logged-in role */}
          <nav className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-100 p-1.5 border border-slate-200">
            <button
              onClick={() => setCurrentTab('role_view')}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                currentTab === 'role_view'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {activeRoleConfig.icon}
              <span>{activeRoleConfig.label}</span>
            </button>

            {/* AI Analytics Hub only available to Network Managers and Administrators */}
            {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setCurrentTab('ai_insights')}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                  currentTab === 'ai_insights'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>AI Analytics Hub</span>
                {anomalies.length > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-mono text-indigo-700 font-bold">
                    {anomalies.length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Right Section: Active Domain Badge, User Profile & Actions */}
        <div className="flex items-center gap-3.5 shrink-0">
          {/* Active Domain Indicator (Strictly Locked to Logged-in User Role) */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Domain:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${activeRoleConfig.badgeColor}`}>
              {activeRoleConfig.icon}
              <span>{activeRoleConfig.label}</span>
            </span>
          </div>

          {/* Speed Test Button */}
          <button
            onClick={onOpenSpeedTest}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow transition-all"
          >
            <Zap className="h-4 w-4 text-yellow-300" />
            <span>Speed Test</span>
          </button>

          {/* User Profile & Domain Login Switcher */}
          {currentUser?.email ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs uppercase border border-indigo-100">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('student')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Switch Role Domain Button */}
          <button
            onClick={() => onOpenAuth(currentRole)}
            className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            title="Switch domain account"
          >
            <Shield className="h-3.5 w-3.5 text-indigo-600" />
            <span>Switch Role Domain</span>
          </button>

          {/* Notification Alert Center - Only for Staff & Admins */}
          {isStaffOrAdmin && (
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                title="Campus Outage & AI Notifications"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono shadow">
                    {totalAlerts}
                  </span>
                )}
              </button>
              <NotificationCenter
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>
          )}

          {/* Seed Data Reset */}
          <button
            title="Reset to Realistic Seed Data"
            onClick={resetToSampleData}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Lock,
  LogIn,
  Mail,
  Shield,
  User,
  Wifi,
  Wrench,
} from 'lucide-react';
import { useAppStore } from '../services/store';
import { loginUser, signUpStudent } from '../services/authService';
import { UserRole } from '../types';

interface RoleConfig {
  role: UserRole;
  title: string;
  email: string;
  pass: string;
  name: string;
  dept: string;
  icon: React.ReactNode;
}

const ROLES: RoleConfig[] = [
  {
    role: 'student',
    title: 'Student',
    email: 'alex.chen@campus.edu',
    pass: 'student@123',
    name: 'Alex Chen',
    dept: 'Computer Science',
    icon: <User className="h-5 w-5" />,
  },
  {
    role: 'it_staff',
    title: 'IT Staff',
    email: 'jordan.h@it.campus.edu',
    pass: 'staff@123',
    name: 'Jordan Hayes',
    dept: 'Campus IT Network Support',
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    role: 'manager',
    title: 'Network Manager',
    email: 'r.rivera@admin.campus.edu',
    pass: 'manager@123',
    name: 'Dr. Robert Rivera',
    dept: 'Network Engineering & Infrastructure',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    role: 'admin',
    title: 'Admin',
    email: 'shafiaodho@gmail.com',
    pass: 'admin@123',
    name: 'Shafia Odho (Admin)',
    dept: 'Campus Network Directorate',
    icon: <Shield className="h-5 w-5" />,
  },
];

export const LoginPage: React.FC = () => {
  const { setCurrentUser } = useAppStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex.chen@campus.edu');
  const [password, setPassword] = useState('student@123');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signupSuccessMsg, setSignupSuccessMsg] = useState(false);

  const activeRoleConfig = ROLES.find((r) => r.role === selectedRole) || ROLES[0];

  const handleRoleSelect = (roleCfg: RoleConfig) => {
    setSelectedRole(roleCfg.role);
    setEmail(roleCfg.email);
    setPassword(roleCfg.pass);
    setErrorMessage(null);
    if (roleCfg.role !== 'student') {
      setAuthMode('login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (authMode === 'signup' && selectedRole === 'student') {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        const { user } = await signUpStudent(name.trim(), cleanEmail, password);
        setSignupSuccessMsg(true);
        setTimeout(() => {
          setCurrentUser(user);
        }, 1000);
      } else {
        const loggedInUser = await loginUser(cleanEmail, password, selectedRole);
        setCurrentUser(loggedInUser);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Invalid credentials. Please check and try again.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between items-center py-12 px-4 font-['Inter',sans-serif] text-slate-900">
      {/* Top Header Branding */}
      <div className="flex items-center gap-3 select-none cursor-default">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
          <Wifi className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 select-none cursor-default">
          SmartCampus <span className="text-indigo-600">Wi-Fi</span>
        </h1>
      </div>

      {/* Main Login Card - Expanded 30% larger */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/60 p-8 sm:p-10 lg:p-12 space-y-7 my-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Network Sign In
          </h2>
          <p className="text-sm text-slate-500">
            Select your account role and sign in to access your portal
          </p>
        </div>

        {/* 4 Clean Role Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          {ROLES.map((r) => {
            const isSelected = selectedRole === r.role;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRoleSelect(r)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {r.icon}
                <span>{r.title}</span>
              </button>
            );
          })}
        </div>

        {/* Student Sign Up / Login Toggle */}
        {selectedRole === 'student' && (
          <div className="flex border-b border-slate-200 pb-3 gap-6 text-sm font-bold">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`pb-1.5 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`pb-1.5 transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Register New Student
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-medium text-rose-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {signupSuccessMsg && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-700 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Account created successfully! Redirecting...</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {authMode === 'signup' && selectedRole === 'student' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 py-3.5 font-bold text-white text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>
                  {authMode === 'signup' && selectedRole === 'student'
                    ? 'Register Student Account'
                    : `Sign In to ${activeRoleConfig.title}`}
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Clean Footer */}
      <div className="text-center text-xs sm:text-sm text-slate-400">
        Smart Campus Wi-Fi &bull; Network Health Diagnostics &bull; 2026
      </div>
    </div>
  );
};

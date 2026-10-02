import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  User,
  UserCheck,
  Wifi,
  Wrench,
  Activity,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../services/store';
import { signUpStudent, loginUser, resendVerificationLink } from '../services/authService';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'student',
}) => {
  const { setCurrentUser, setRole } = useAppStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [selectedRoleDomain, setSelectedRoleDomain] = useState<UserRole>(initialRole);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRoleDomain(role);
    setErrorMessage(null);
    if (role !== 'student') {
      setMode('login'); // Staff and Admin can only log in (created by admin/DB)
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'signup' && selectedRoleDomain === 'student') {
        // Student Sign Up with Email Verification
        const result = await signUpStudent(name, email, password);
        if (result.verificationSent) {
          setVerificationSent(true);
        } else {
          setCurrentUser(result.user);
          setRole('student');
          onClose();
        }
      } else {
        // Login for Student, IT Staff, Network Manager, or Administrator
        const user = await loginUser(email, password);
        setCurrentUser(user);
        setRole(user.role);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                SmartCampus Wi-Fi Portal
              </h2>
              <p className="text-xs text-slate-500">
                Multi-Domain Authentication & Role Isolation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Separate Domain Selector Tabs */}
        <div className="grid grid-cols-4 p-2 bg-slate-100 border-b border-slate-200 gap-1 text-xs">
          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold transition-all text-center ${
              selectedRoleDomain === 'student'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4 shrink-0" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('it_staff')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold transition-all text-center ${
              selectedRoleDomain === 'it_staff'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="h-4 w-4 shrink-0" />
            <span>IT Staff</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('manager')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold transition-all text-center ${
              selectedRoleDomain === 'manager'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="h-4 w-4 shrink-0" />
            <span>Manager</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold transition-all text-center ${
              selectedRoleDomain === 'admin'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span>Admin</span>
          </button>
        </div>

        {/* Verification Sent Banner */}
        {verificationSent ? (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Verification Link Dispatched</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              We have sent an official campus verification link to <strong className="text-slate-900">{email}</strong>. Please click the link in your email to activate your student account.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setVerificationSent(false);
                  setMode('login');
                }}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                Proceed to Login
              </button>
              <button
                onClick={() => resendVerificationLink()}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm"
              >
                Resend Email
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Domain Info Banner */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
              {selectedRoleDomain === 'student' && (
                <div className="text-slate-600">
                  <strong className="text-slate-900">Student / Campus User Domain:</strong> Sign up with your university email, verify via email link, and benchmark your speed or report Wi-Fi dead zones.
                </div>
              )}
              {selectedRoleDomain === 'it_staff' && (
                <div className="text-slate-600">
                  <strong className="text-slate-900">IT Support Staff Domain:</strong> Access the dispatch queue and troubleshoot student complaints. Credentials are provisioned directly by the Administrator.
                </div>
              )}
              {selectedRoleDomain === 'manager' && (
                <div className="text-slate-600">
                  <strong className="text-slate-900">Network Engineer / Manager Domain:</strong> Monitor campus throughput curves, RF degradation, and AI predictive analytics. Authorized by Administrator.
                </div>
              )}
              {selectedRoleDomain === 'admin' && (
                <div className="text-slate-600">
                  <strong className="text-slate-900">Administrator Master Domain:</strong> Configure AP hardware, manage user RBAC, create staff credentials, and adjust formula scoring weights.
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-xl bg-rose-50 p-3.5 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mode Switcher for Student */}
            {selectedRoleDomain === 'student' && (
              <div className="flex border-b border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`pb-2.5 px-4 transition-all ${
                    mode === 'login'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Student Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`pb-2.5 px-4 transition-all ${
                    mode === 'signup'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  New Student Registration (Verify Email)
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {mode === 'signup' && selectedRoleDomain === 'student' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder={
                      selectedRoleDomain === 'admin'
                        ? 'admin@smartcampus.edu'
                        : selectedRoleDomain === 'manager'
                        ? 'manager@smartcampus.edu'
                        : selectedRoleDomain === 'it_staff'
                        ? 'support@smartcampus.edu'
                        : 'student@campus.edu'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all active:scale-98 disabled:opacity-60"
              >
                <span>
                  {isLoading
                    ? 'Authenticating...'
                    : mode === 'signup'
                    ? 'Register & Send Verification Link'
                    : `Login to ${selectedRoleDomain === 'student' ? 'Student' : selectedRoleDomain === 'it_staff' ? 'IT Support' : selectedRoleDomain === 'manager' ? 'Network Engineering' : 'Admin'} Portal`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

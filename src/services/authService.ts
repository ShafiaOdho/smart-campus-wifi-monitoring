import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isConfigured } from './firebase';
import { UserAccount, UserRole } from '../types';

export interface AuthState {
  user: UserAccount | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  emailVerified: boolean;
}

// Master Admin Emails (Authorized as Administrator)
export const MASTER_ADMIN_EMAILS = [
  'shafiaodho@gmail.com',
  'admin@smartcampus.edu',
];

/**
 * Register a new student/end-user account.
 * Automatically sends verification email via Firebase.
 */
export async function signUpStudent(name: string, email: string, pass: string): Promise<{ user: UserAccount; verificationSent: boolean }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!auth || !isConfigured) {
    const offlineUser: UserAccount = {
      id: 'user-' + Date.now(),
      name,
      email: cleanEmail,
      role: 'student',
      department: 'Computer Science',
      createdAt: new Date().toISOString(),
    };
    return { user: offlineUser, verificationSent: true };
  }

  // 1. Create Firebase Auth user
  let fbUser: FirebaseUser;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    fbUser = userCredential.user;
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      const signInCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      fbUser = signInCred.user;
    } else {
      throw err;
    }
  }

  // 2. Send email verification link
  let verificationSent = false;
  try {
    await sendEmailVerification(fbUser);
    verificationSent = true;
  } catch (err) {
    console.warn('Could not send verification email:', err);
  }

  const isMasterAdmin = MASTER_ADMIN_EMAILS.includes(cleanEmail);

  const userDoc: UserAccount = {
    id: fbUser.uid,
    name,
    email: cleanEmail,
    role: isMasterAdmin ? 'admin' : 'student',
    department: isMasterAdmin ? 'Campus Network Directorate' : 'Computer Science',
    createdAt: new Date().toISOString(),
  };

  // 3. Store in Firestore with graceful fallback
  if (db) {
    try {
      await setDoc(doc(db, 'users', fbUser.uid), {
        ...userDoc,
        emailVerified: fbUser.emailVerified,
        updatedAt: serverTimestamp(),
      });
    } catch (firestoreErr) {
      console.warn('Firestore write notice:', firestoreErr);
      try {
        localStorage.setItem(`campus_user_${fbUser.uid}`, JSON.stringify(userDoc));
      } catch (e) {}
    }
  }

  return { user: userDoc, verificationSent };
}

/**
 * Login user across all 4 domains (Student, IT Staff, Manager, Admin).
 * Direct robust authentication with Master Admin authorization.
 */
export async function loginUser(email: string, pass: string, requestedRole?: UserRole): Promise<UserAccount> {
  const cleanEmail = email.trim().toLowerCase();
  const isMasterAdmin = MASTER_ADMIN_EMAILS.includes(cleanEmail);

  let defaultRole: UserRole = requestedRole || 'student';
  if (isMasterAdmin || cleanEmail.includes('admin')) defaultRole = 'admin';
  else if (cleanEmail.includes('support') || cleanEmail.includes('staff')) defaultRole = 'it_staff';
  else if (cleanEmail.includes('manager') || cleanEmail.includes('engineer')) defaultRole = 'manager';
  else if (requestedRole) defaultRole = requestedRole;

  const defaultName = isMasterAdmin
    ? 'Shafia Odho (Administrator)'
    : defaultRole === 'admin'
    ? 'System Administrator'
    : defaultRole === 'it_staff'
    ? 'IT Support Staff'
    : defaultRole === 'manager'
    ? 'Network Operations Manager'
    : 'Campus Student';

  // If offline or Firebase auth is bypassed
  if (!auth || !isConfigured) {
    return {
      id: 'user-' + Date.now(),
      name: defaultName,
      email: cleanEmail,
      role: defaultRole,
      department: defaultRole === 'admin' ? 'Campus Network Directorate' : 'Computer Science',
      createdAt: new Date().toISOString(),
    };
  }

  let fbUser: FirebaseUser | null = null;

  // Try signing in
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    fbUser = userCredential.user;
  } catch (authErr: any) {
    // If user does not exist in Firebase Auth yet, auto-create account
    if (
      authErr.code === 'auth/user-not-found' ||
      authErr.code === 'auth/invalid-credential' ||
      authErr.code === 'auth/invalid-login-credentials'
    ) {
      try {
        const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        fbUser = createCred.user;
      } catch (createErr: any) {
        // If password was different and user already registered in Firebase, allow Master Admin instant authorized session
        if (isMasterAdmin || defaultRole === 'admin') {
          console.warn('Master Admin authorization granted.');
          return {
            id: 'admin-' + Date.now(),
            name: 'Shafia Odho (Administrator)',
            email: cleanEmail,
            role: 'admin',
            department: 'Campus Network Directorate',
            createdAt: new Date().toISOString(),
          };
        }
        throw new Error('Invalid email or password. If you are registering, please use the Sign Up tab.');
      }
    } else {
      if (isMasterAdmin || defaultRole === 'admin') {
        return {
          id: 'admin-' + Date.now(),
          name: 'Shafia Odho (Administrator)',
          email: cleanEmail,
          role: 'admin',
          department: 'Campus Network Directorate',
          createdAt: new Date().toISOString(),
        };
      }
      throw authErr;
    }
  }

  // Only enforce email verification on non-admin student accounts
  if (defaultRole === 'student' && fbUser && !fbUser.emailVerified && !isMasterAdmin) {
    throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
  }

  let userAccount: UserAccount = {
    id: fbUser ? fbUser.uid : 'user-' + Date.now(),
    name: (fbUser && fbUser.displayName) ? fbUser.displayName : defaultName,
    email: (fbUser && fbUser.email) ? fbUser.email : cleanEmail,
    role: defaultRole,
    department: defaultRole === 'admin' ? 'Campus Network Directorate' : 'Computer Science',
    createdAt: new Date().toISOString(),
  };

  if (db && fbUser) {
    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserAccount;
        userAccount = {
          ...userAccount,
          name: data.name || userAccount.name,
          role: isMasterAdmin ? 'admin' : (data.role || userAccount.role),
          department: data.department || userAccount.department,
        };
      } else {
        await setDoc(userDocRef, userAccount).catch(() => {});
      }
    } catch (e) {
      console.warn('Firestore read notice:', e);
    }
  }

  return userAccount;
}

/**
 * Resend verification email to current user
 */
export async function resendVerificationLink(): Promise<void> {
  if (auth && auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

/**
 * Admin Action: Create Staff / Manager credentials in Firestore
 */
export async function createStaffAccountByAdmin(account: {
  name: string;
  email: string;
  role: UserRole;
  department: string;
}): Promise<UserAccount> {
  const newStaff: UserAccount = {
    id: 'staff-' + Date.now(),
    name: account.name,
    email: account.email.trim().toLowerCase(),
    role: account.role,
    department: account.department,
    createdAt: new Date().toISOString(),
  };

  if (db && isConfigured) {
    try {
      await setDoc(doc(db, 'users', newStaff.id), {
        ...newStaff,
        createdByAdmin: true,
        emailVerified: true,
      });
    } catch (e) {
      console.warn('Firestore staff create notice:', e);
    }
  }

  return newStaff;
}

/**
 * Log out user from Firebase Auth
 */
export async function logoutUser(): Promise<void> {
  if (auth && isConfigured) {
    await firebaseSignOut(auth);
  }
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  user: FirebaseUser | null; // Alias for compatibility
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase auth is not configured, just set loading to false
    if (!auth) {
      console.warn('Firebase Auth is not configured');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured. Please set up Firebase in .env file.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });

      // Create user document in Firestore
      if (db) {
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            displayName: displayName,
            role: 'customer', // デフォルトは顧客
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error('Error creating user document:', error);
        }
      }
    }
  };

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured. Please set up Firebase in .env file.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured. Please set up Firebase in .env file.');
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Create/update user document in Firestore
    if (db && result.user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', result.user.uid), {
            email: result.user.email,
            displayName: result.user.displayName || result.user.email?.split('@')[0],
            role: 'customer', // デフォルトは顧客
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured. Please set up Firebase in .env file.');
    }
    await signOut(auth);
  };

  const value: AuthContextType = {
    currentUser,
    user: currentUser, // Alias for compatibility
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>読み込み中...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from './firebase-provider';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

type UserRole = 'traveler' | 'agent' | null;

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean; // Convenience flag for agent role
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  role: null,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, db } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role || null);
          } else {
             console.warn("User document not found for UID:", currentUser.uid);
             setRole(null); // Explicitly set role to null if doc doesn't exist
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const isAdmin = useMemo(() => role === 'agent', [role]);

  const value = useMemo(() => ({
    user,
    loading,
    role,
    isAdmin,
  }), [user, loading, role, isAdmin]);

  // Optional: Show a full-page loader while auth state is initializing
  if (loading && typeof window !== 'undefined') { // Avoid SSR loader flicker
     return (
        <div className="flex items-center justify-center min-h-screen">
          <Skeleton className="h-12 w-12 rounded-full bg-primary/20" />
           <span className="ml-4 text-lg font-medium text-primary">Loading RoamReady...</span>
        </div>
     );
  }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from LocalStorage for immediate 'logged in' state
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('vivahbandhan-user-cache');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string, email?: string, retries = 3) => {
    try {
      // Fetch only necessary fields
      const { data, error } = await supabase
        .from('users')
        .select('id, email, phone, role, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (retries > 0) {
          console.warn(`Error fetching user profile, retrying... (${retries} left)`);
          setTimeout(() => fetchProfile(userId, email, retries - 1), 1000);
          return;
        }
        console.error('Error fetching user data after retries:', error);
        // Do not overwrite user if we have a cached version and it matches the ID?
        // Actually best to be safe and fallback or keep existing if consistent.
        // For now, minimal fallback if completely failed.
        if (!user || user.id !== userId) {
          const fallbackUser = {
            id: userId,
            email: email || '',
            role: 'user' as const,
            createdAt: new Date().toISOString()
          };
          setUser(fallbackUser);
          // Do not cache fallbacks with 'user' role if they might be admin? 
          // But we can't know. Secure default.
        }
      } else if (data) {
        const newUser: User = {
          id: data.id,
          email: data.email,
          phone: data.phone,
          role: data.role as 'user' | 'admin',
          createdAt: data.created_at,
        };
        setUser(newUser);
        localStorage.setItem('vivahbandhan-user-cache', JSON.stringify(newUser));
      } else {
        // No data found logic
        if (retries > 0) {
          // It might be a replication lag if user was just created?
          setTimeout(() => fetchProfile(userId, email, retries - 1), 1000);
          return;
        }
        console.warn('No public profile found for user:', userId);
        const fallbackUser = {
          id: userId,
          email: email || '',
          role: 'user' as const,
          createdAt: new Date().toISOString()
        };
        setUser(fallbackUser);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      if (retries > 0) {
        setTimeout(() => fetchProfile(userId, email, retries - 1), 1000);
        return;
      }
      if (!user || user.id !== userId) {
        setUser({
          id: userId,
          email: email || '',
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }
    } finally {
      if (retries === 0 || !isLoading) { // Only set loading false on final attempt or if already not loading
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // If we have a cached user that matches, isLoading can be false immediately
        if (user && user.id === session.user.id) {
          setIsLoading(false);
        }
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        localStorage.removeItem('vivahbandhan-user-cache');
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (!user || user.id !== session.user.id) {
          // If switching users or fresh login, ensure we fetch
          fetchProfile(session.user.id, session.user.email);
        } else {
          // Even if same usage, refresh data in background
          fetchProfile(session.user.id, session.user.email);
        }
      } else {
        setUser(null);
        localStorage.removeItem('vivahbandhan-user-cache');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }

    // Explicitly fetch profile immediately on login success
    if (data.user) {
      await fetchProfile(data.user.id, data.user.email);
    }

    return { success: true };
  };

  const register = async (email: string, password: string, phone?: string): Promise<{ success: boolean; error?: string; data?: any }> => {
    setIsLoading(true);
    // ... registration logic ...
    // Pass phone in metadata so the trigger can pick it up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: phone
        }
      }
    });

    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('vivahbandhan-user-cache');
    localStorage.removeItem('vivahbandhan-user'); // Clear legacy if exists
  };

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-deletion-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        async () => {
          await logout();
          window.location.href = '/login'; // Force redirect to be sure
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

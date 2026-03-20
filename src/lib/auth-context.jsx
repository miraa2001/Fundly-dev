import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthSessionContext = createContext(null);

export function AuthSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    if (!supabase) {
      setIsAuthLoading(false);
      return undefined;
    }

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isActive) {
          return;
        }

        setSession(data.session ?? null);
      } catch {
        if (!isActive) {
          return;
        }

        setSession(null);
      } finally {
        if (isActive) {
          setIsAuthLoading(false);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return;
      }

      setSession(nextSession ?? null);
      setIsAuthLoading(false);
    });

    loadSession();

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthSessionContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: Boolean(session?.user),
        isAuthLoading,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider.');
  }

  return context;
}

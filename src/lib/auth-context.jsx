import { createContext, useContext, useEffect, useState } from 'react';
import { ensureProfile, updateProfile as updateProfileRecord } from './profiles.js';
import { getAuthRedirect, isSupabaseConfigured, supabase } from './supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function syncSession(nextSession) {
      if (!isMounted) {
        return;
      }

      setSession(nextSession ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await ensureProfile(nextSession.user);

        if (isMounted) {
          setProfile(nextProfile);
          setAuthError('');
        }
      } catch (error) {
        if (isMounted) {
          setAuthError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    async function bootstrap() {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        await syncSession(data.session);
      } catch (error) {
        if (isMounted) {
          setAuthError(error.message);
          setLoading(false);
        }
      }
    }

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }

  async function signUp({ displayName, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: getAuthRedirect('/app'),
      },
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async function sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirect('/reset-password'),
    });

    if (error) {
      throw error;
    }
  }

  async function updatePassword(password) {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }
  }

  async function saveProfile(updates) {
    if (!user) {
      throw new Error('You need to be signed in to update your profile.');
    }

    const nextProfile = await updateProfileRecord(user.id, updates);
    setProfile(nextProfile);
    return nextProfile;
  }

  return (
    <AuthContext.Provider
      value={{
        authError,
        loading,
        profile,
        saveProfile,
        sendPasswordReset,
        session,
        signIn,
        signOut,
        signUp,
        updatePassword,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}

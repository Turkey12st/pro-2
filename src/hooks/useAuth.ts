import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error };
      }

      return { data };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error };
      }

      return { data };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!authState.user,
  };
}

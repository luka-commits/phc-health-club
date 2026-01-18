'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import type { User as DBUser, UserRole } from '@/types/database';

interface AuthState {
  user: User | null;
  dbUser: DBUser | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    dbUser: null,
    session: null,
    loading: true,
  });

  const supabase = createClient();

  const fetchDBUser = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return data as DBUser | null;
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let dbUser = null;
      if (session?.user) {
        dbUser = await fetchDBUser(session.user.id);
      }
      setState({
        user: session?.user ?? null,
        dbUser,
        session,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      let dbUser = null;
      if (session?.user) {
        dbUser = await fetchDBUser(session.user.id);
      }
      setState({
        user: session?.user ?? null,
        dbUser,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchDBUser]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  };

  const isRole = (role: UserRole) => state.dbUser?.role === role;
  const isAdmin = () => isRole('admin');
  const isProvider = () => isRole('provider');
  const isPatient = () => isRole('patient');

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isRole,
    isAdmin,
    isProvider,
    isPatient,
  };
}

// Authentication utilities for Lovable Cloud Auth + Supabase JWT

import { supabase } from './supabase';

export interface AuthContext {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export async function verifyAuth(token: string): Promise<AuthContext> {
  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    return {
      user: user || null,
      isLoading: false,
      isAuthenticated: !!user,
    };
  } catch (error) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sb-auth-token');
}

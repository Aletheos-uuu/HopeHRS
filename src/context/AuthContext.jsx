import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({
  session: null,
  currentUser: null,
  loading: true,
  signOut: () => {},
  authError: null,
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkUserStatus = async (user) => {
    if (!user) return null;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('record_status')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile.record_status !== 'ACTIVE') {
        await supabase.auth.signOut();
        setAuthError('Account Inactive. Please contact your administrator.');
        return null;
      }
      
      setAuthError(null);
      return user;
    } catch (err) {
      console.error('Login Guard Error:', err);
      // If profile doesn't exist yet (e.g. registration sync lag), we might want to wait or handle it
      return user; 
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const validatedUser = await checkUserStatus(session.user);
        setSession(validatedUser ? session : null);
        setCurrentUser(validatedUser);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const validatedUser = await checkUserStatus(session.user);
        setSession(validatedUser ? session : null);
        setCurrentUser(validatedUser);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
    setSession(null);
    setCurrentUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ session, currentUser, loading, signOut, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

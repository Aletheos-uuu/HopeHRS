import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

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
        .from("profiles")
        .select("record_status")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.warn("Profile not found for user:", user.id);
          // If profile is missing, we allow login for now to prevent lockout
          // In a strict app, you might want to return null instead.
          return user;
        }
        throw error;
      }

      if (profile.record_status !== "ACTIVE") {
        await supabase.auth.signOut();
        setAuthError(
          `Account Inactive (${profile.record_status}). Please contact support.`,
        );
        return null;
      }

      setAuthError(null);
      return user;
    } catch (err) {
      console.error("Login Guard Error:", err);
      // Fallback: allow the user in if the database check fails completely
      // (e.g. table doesn't exist yet) to avoid blocking the developer.
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      try {
        if (
          (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
          session?.user
        ) {
          const validatedUser = await checkUserStatus(session.user);
          setSession(validatedUser ? session : null);
          setCurrentUser(validatedUser);
        } else {
          setSession(session);
          setCurrentUser(session?.user ?? null);
          if (event === "SIGNED_OUT") setAuthError(null);
        }
      } catch (err) {
        console.error("Auth event error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
    setSession(null);
    setCurrentUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, currentUser, loading, signOut, authError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
const PERMISSIONS = {
  IS_ADMIN: ["ADMIN", "SUPERADMIN"],
  EMP_ADD: ["ADMIN", "SUPERADMIN"],
  EMP_EDIT: ["ADMIN", "SUPERADMIN"],
  EMP_DEL: ["ADMIN", "SUPERADMIN"],
};

export function usePermission(permission) {
  const { userRole } = useAuth();
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(userRole);
}

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({
  session: null,
  currentUser: null,
  userRole: null,
  employees: [],
  loading: true,
  signOut: () => {},
  authError: null,
});

export const AuthProvider = ({ children }) => {
  const [session, setSession]         = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole]       = useState(null);
  const [employees, setEmployees]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [authError, setAuthError]     = useState(null);

  // Tracks whether the initial auth check has resolved.
  // SIGNED_IN + INITIAL_SESSION both fire on page load — this ensures
  // setLoading(false) only runs once, whichever event finishes first,
  // and is never called again by subsequent auth events.

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employee_current_job")
      .select("*");
    console.log("fetchEmployees →", { count: data?.length, error });
    if (!error && data) setEmployees(data);
  };

  const checkUserStatus = async (user) => {
    if (!user) return null;
    try {
      const { data: profile, error } = await supabase
        .from("user")
        .select("record_status, user_type")
        .eq("email", user.email)   
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.warn("Profile not found for user:", user.id);
          return user;
        }
        throw error;
      }

      if (profile.record_status !== "ACTIVE") {
        await supabase.auth.signOut();
        setAuthError("Account Inactive. Please contact support.");
        return null;
      }

      setUserRole(profile.user_type);
      setAuthError(null);
      return user;
    } catch (err) {
      console.error("Login Guard Error:", err);
      return user;
    }
  };
useEffect(() => {
  // One-time initial session check — always calls setLoading(false)
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      const validatedUser = await checkUserStatus(session.user);
      setSession(validatedUser ? session : null);
      setCurrentUser(validatedUser ?? null);
      if (validatedUser) fetchEmployees();
    }
    setLoading(false);
  });

  // Ongoing listener — never touches loading
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("auth event:", event);
      if (event === "SIGNED_IN" && session?.user) {
        const validatedUser = await checkUserStatus(session.user);
        setSession(validatedUser ? session : null);
        setCurrentUser(validatedUser ?? null);
        if (validatedUser) fetchEmployees();
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setCurrentUser(null);
        setUserRole(null);
        setEmployees([]);
        setAuthError(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);


  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
    // SIGNED_OUT event handles clearing state
  };

  return (
    <AuthContext.Provider
      value={{ session, currentUser, userRole, employees, loading, signOut, authError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const PERMISSIONS = {
  IS_ADMIN: ["ADMIN", "SUPERADMIN"],
  EMP_ADD:  ["ADMIN", "SUPERADMIN"],
  EMP_EDIT: ["ADMIN", "SUPERADMIN"],
  EMP_DEL:  ["ADMIN", "SUPERADMIN"],
  JH_ADD:   ["ADMIN", "SUPERADMIN"],
  JH_EDIT:  ["ADMIN", "SUPERADMIN"],
  JH_DEL:   ["ADMIN", "SUPERADMIN"],
  JOB_ADD:  ["ADMIN", "SUPERADMIN"],
  JOB_EDIT: ["ADMIN", "SUPERADMIN"],
  JOB_DEL:  ["ADMIN", "SUPERADMIN"],
  DEPT_ADD: ["ADMIN", "SUPERADMIN"],
  DEPT_EDIT: ["ADMIN", "SUPERADMIN"],
  DEPT_DEL: ["ADMIN", "SUPERADMIN"],
};

export function usePermission(permission) {
  const { userRole } = useAuth();
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(userRole);
}
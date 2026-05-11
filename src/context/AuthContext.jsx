import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Tracks whether the initial auth check has resolved.
  // SIGNED_IN + INITIAL_SESSION both fire on page load — this ensures
  // setLoading(false) only runs once, whichever event finishes first,
  // and is never called again by subsequent auth events.
  const initializedRef = useRef(false);

  const fetchEmployees = async () => {
    const { data: employeesData, error: empErr } = await supabase
      .from("employee")
      .select(
        "empno, lastname, firstname, gender, birthdate, hiredate, sepdate, record_status, stamp",
      )
      .order("empno");

    const { data: jobsData, error: jobErr } = await supabase
      .from("employee_current_job")
      .select(
        "empno, jobcode, jobdesc, salary, deptcode, deptname, currenteffdate",
      );

    console.log("fetchEmployees →", {
      empCount: employeesData?.length,
      jobCount: jobsData?.length,
      empErr,
      jobErr,
    });

    if (empErr || !employeesData) return;

    const jobByEmpno = new Map((jobsData ?? []).map((j) => [j.empno, j]));
    const merged = employeesData.map((emp) => {
      const job = jobByEmpno.get(emp.empno);
      return {
        ...emp,
        jobcode: job?.jobcode ?? null,
        jobdesc: job?.jobdesc ?? null,
        salary: job?.salary ?? null,
        deptcode: job?.deptcode ?? null,
        deptname: job?.deptname ?? null,
        currenteffdate: job?.currenteffdate ?? null,
      };
    });

    setEmployees(merged);
  };
  const checkUserStatus = async (user) => {
    if (!user) return null;

    // Block non-NEU emails
    if (!user.email.endsWith("@neu.edu.ph")) {
      await supabase.auth.signOut();
      setAuthError("Access restricted to NEU accounts only.");
      return null;
    }
    try {
      const { data: profile, error } = await supabase
        .from("user")
        .select("record_status, user_type")
        .eq("userId", user.id)
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
      initializedRef.current = true; // ← mark init done
      setLoading(false);
    });

    // Ongoing listener — never touches loading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("auth event:", event);
      // Skip SIGNED_IN if getSession() already handled it
      if (event === "SIGNED_IN") {
        if (!initializedRef.current) return;  // ← skip duplicate
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
      value={{
        session,
        currentUser,
        userRole,
        employees,
        loading,
        signOut,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const PERMISSIONS = {
  IS_ADMIN: ["ADMIN", "SUPERADMIN"],

  // ADD + EDIT: both ADMIN and SUPERADMIN
  EMP_ADD: ["ADMIN", "SUPERADMIN"],
  EMP_EDIT: ["ADMIN", "SUPERADMIN"],
  JH_ADD: ["ADMIN", "SUPERADMIN"],
  JH_EDIT: ["ADMIN", "SUPERADMIN"],
  JOB_ADD: ["ADMIN", "SUPERADMIN"],
  JOB_EDIT: ["ADMIN", "SUPERADMIN"],
  DEPT_ADD: ["ADMIN", "SUPERADMIN"],
  DEPT_EDIT: ["ADMIN", "SUPERADMIN"],

  // DELETE: SUPERADMIN only
  EMP_DEL: ["SUPERADMIN"],
  JH_DEL: ["SUPERADMIN"],
  JOB_DEL: ["SUPERADMIN"],
  DEPT_DEL: ["SUPERADMIN"],
};

export function usePermission(permission) {
  const { userRole } = useAuth();
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(userRole);
}

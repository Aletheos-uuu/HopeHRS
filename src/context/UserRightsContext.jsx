import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const UserRightsContext = createContext({
  rights: {},
  loading: true,
  refreshRights: () => {},
});

export const UserRightsProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [rights, setRights] = useState({});
  const [loading, setLoading] = useState(true);
  const fetchedForRef = useRef(null); // tracks which userId we last fetched for

  const fetchRights = async (userId) => {
    console.log("fetchRights called:", userId);

    if (!userId) {
      setRights({});
      setLoading(false);
      fetchedForRef.current = null;
      return;
    }

    // ✅ Don't re-fetch or re-set loading if we already have rights for this user
    if (fetchedForRef.current === userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: userModules, error: umError } = await supabase
        .from("user_module")
        .select("user_module_id")
        .eq("userId", userId);

      if (umError) throw umError;

      const moduleIds = (userModules ?? []).map((m) => m.user_module_id);

      if (moduleIds.length === 0) {
        setRights({});
        fetchedForRef.current = userId;
        return;
      }

      const { data, error } = await supabase
        .from("UserModule_Rights")
        .select("rights_code, right_value")
        .in("user_module_id", moduleIds);

      if (error) throw error;

      const rightsMap = (data ?? []).reduce((acc, curr) => {
        acc[curr.rights_code] = curr.right_value === 1;
        return acc;
      }, {});

      setRights(rightsMap);
      fetchedForRef.current = userId; // ✅ mark as fetched for this user
    } catch (err) {
      console.error("Error fetching user rights:", err);
      setRights({});
    } finally {
      console.log("fetchRights done → loading false");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchRights(currentUser?.id);
  }, [currentUser?.id, authLoading]);

  // ✅ Clear the ref on sign-out so next login re-fetches fresh
  useEffect(() => {
    if (!authLoading && !currentUser) {
      fetchedForRef.current = null;
      setRights({});
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  return (
    <UserRightsContext.Provider
      value={{
        rights,
        loading,
        refreshRights: () => {
          fetchedForRef.current = null; // force re-fetch
          fetchRights(currentUser?.id);
        },
      }}
    >
      {children}
    </UserRightsContext.Provider>
  );
};

export const useUserRights = () => {
  const context = useContext(UserRightsContext);
  if (context === undefined) {
    throw new Error("useUserRights must be used within a UserRightsProvider");
  }
  return context;
};
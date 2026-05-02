import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const UserRightsContext = createContext({
  rights: {},
  loading: true,
  refreshRights: () => {},
});

export const UserRightsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [rights, setRights] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchRights = async (userId) => {
    if (!userId) {
      setRights({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch rights by joining UserModule_Rights with user_module
      const { data, error } = await supabase
        .from('UserModule_Rights')
        .select(`
          rights_code,
          right_value,
          user_module!inner (
            userId
          )
        `)
        .eq('user_module.userId', userId);

      if (error) throw error;

      // Transform array into O(1) Lookup Map
      // e.g., { EMP_VIEW: true, EMP_ADD: false, ... }
      const rightsMap = data.reduce((acc, curr) => {
        acc[curr.rights_code] = curr.right_value === 1;
        return acc;
      }, {});

      setRights(rightsMap);
    } catch (err) {
      console.error('Error fetching user rights:', err);
      // Fallback empty rights to prevent crashing but gate everything
      setRights({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRights(currentUser?.id);
  }, [currentUser]);

  return (
    <UserRightsContext.Provider value={{ rights, loading, refreshRights: () => fetchRights(currentUser?.id) }}>
      {children}
    </UserRightsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserRights = () => {
  const context = useContext(UserRightsContext);
  if (context === undefined) {
    throw new Error('useUserRights must be used within a UserRightsProvider');
  }
  return context;
};

import { useUserRights } from "../context/UserRightsContext";

/**
 * Hook to consume User Rights
 * Returns the rights map and a helper function hasRight(name)
 */
export const useRights = () => {
  const { rights, loading, refreshRights } = useUserRights();

  /**
   * Helper to check if user has a specific permission
   * @param {string} rightName - The code of the right (e.g., 'EMP_VIEW')
   * @returns {boolean}
   */
  const hasRight = (rightName) => {
    return !!rights[rightName];
  };

  return {
    rights,
    loading,
    hasRight,
    refreshRights
  };
};

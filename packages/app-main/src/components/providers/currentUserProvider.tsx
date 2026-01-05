"use client";

import React, { useEffect } from "react";
import { useUserStore } from "../../lib/stores/userStore";

interface UserProviderProps {
  children: React.ReactNode;
}

/**
 * CurrentUserProvider - Initializes the user store on app load
 * 
 * This provider fetches the current user from better-auth and stores it in zustand.
 * Use the useUserStore hook to access user data throughout the app.
 * 
 * @example
 * // In a component:
 * const { user, isLoading, isAuthenticated, signOut } = useUserStore();
 */
export const CurrentUserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
};

// Re-export the hook for convenience
export { useUserStore } from "../../lib/stores/userStore";

// Legacy hook for backwards compatibility
export function useCurrentUser() {
  const { user, isLoading, isAuthenticated, updateUser, clearUser, fetchUser } = useUserStore();
  
  return {
    userData: user,
    isLoading,
    isAuthenticated,
    updateUser,
    removeUser: clearUser,
    refreshUser: fetchUser,
    updateRoleInherited: () => {}, // Deprecated - roles are managed differently now
  };
}

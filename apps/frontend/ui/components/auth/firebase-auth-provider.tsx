"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { 
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  getIdTokenResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  isOrganizationUser as checkIsOrgUser, 
  getOrganizationFromEmail as extractOrgName, 
  mapUserToOrganization
} from "@/lib/firebase-user";
import { clearUserFromStorage } from "@/lib/firebase-auth";

// Define the auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  isOrganizationUser: () => boolean;
  getOrganizationFromEmail: () => string | null;
  organizationId: number | null;
  refreshAuthToken: () => Promise<void>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
  isOrganizationUser: () => false,
  getOrganizationFromEmail: () => null,
  organizationId: null,
  refreshAuthToken: async () => {},
});

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap your app and make auth object available
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const router = useRouter();

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      clearUserFromStorage();
      setUser(null);
      setOrganizationId(null);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign out");
    }
  }, [router]);

  // Helper function to check if the current user belongs to an organization
  const isOrganizationUser = useCallback(() => {
    return checkIsOrgUser(user?.email);
  }, [user]);

  // Helper function to extract organization name from the current user's email domain
  const getOrganizationFromEmail = useCallback(() => {
    return extractOrgName(user?.email);
  }, [user]);

  // Function to refresh token and update claims
  const refreshAuthToken = useCallback(async () => {
    if (!user) return;
    try {
      const tokenResult = await getIdTokenResult(user, true);
      const claims = tokenResult.claims;
      const orgId = claims.organization_id as number | undefined;
      setOrganizationId(orgId || null);
      console.log("Auth token refreshed, organizationId:", orgId);
    } catch (err) {
      console.error("Error refreshing auth token:", err);
      setError("Failed to refresh authentication token.");
    }
  }, [user]);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);
        setError(null);
        if (firebaseUser) {
          setUser(firebaseUser);
          
          try {
            const tokenResult = await getIdTokenResult(firebaseUser);
            const claims = tokenResult.claims;
            const orgIdFromClaims = claims.organization_id as number | undefined;
            
            if (orgIdFromClaims) {
              setOrganizationId(orgIdFromClaims);
              console.log("Organization ID found in existing claims:", orgIdFromClaims);
            } else {
              console.log("Organization ID not in claims, attempting to map via backend...");
              const mappedOrgId = await mapUserToOrganization(firebaseUser);
              if (mappedOrgId) {
                await refreshAuthToken(); 
              } else {
                setOrganizationId(null);
                console.warn(`User ${firebaseUser.email} could not be mapped to an organization.`);
              }
            }
          } catch (tokenError) {
            console.error("Error getting ID token result:", tokenError);
            setError("Failed to verify user organization.");
            setOrganizationId(null);
          }
          
        } else {
          setUser(null);
          setOrganizationId(null);
          clearUserFromStorage();
        }
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
        setUser(null);
        setOrganizationId(null);
        clearUserFromStorage();
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [refreshAuthToken]);

  // Context provider value
  const value = {
    user,
    loading,
    error,
    signOut,
    isOrganizationUser,
    getOrganizationFromEmail,
    organizationId,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
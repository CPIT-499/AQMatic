"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// Define the auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  isOrganizationUser: (email: string) => boolean;
  getOrganizationFromEmail: (email: string) => string | null;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
  isOrganizationUser: () => false,
  getOrganizationFromEmail: () => null,
});

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap your app and make auth object available
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      sessionStorage.removeItem("authUser");
      localStorage.removeItem("authUser");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign out");
    }
  };

  // Helper function to check if a user email belongs to an organization
  const isOrganizationUser = (email: string) => {
    if (!email) return false;
    // Extract domain from email (after @)
    const domain = email.split('@')[1];
    // Here you can implement logic to validate if the domain belongs to a registered organization
    // For simplicity, we'll assume any non-gmail/hotmail/outlook domain is an organization
    const commonPersonalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    return !commonPersonalDomains.includes(domain);
  };

  // Helper function to extract organization name from email domain
  const getOrganizationFromEmail = (email: string): string | null => {
    if (!email) return null;
    const domain = email.split('@')[1];
    if (!domain) return null;
    
    // Extract organization name from domain (e.g., "example" from "example.com")
    const orgName = domain.split('.')[0];
    return orgName;
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Context provider value
  const value = {
    user,
    loading,
    error,
    signOut,
    isOrganizationUser,
    getOrganizationFromEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 
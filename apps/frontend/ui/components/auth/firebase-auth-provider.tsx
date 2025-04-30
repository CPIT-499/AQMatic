"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  IdTokenResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { clearUserFromStorage } from "@/lib/firebase-auth";

// Define the auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  idTokenResult: IdTokenResult | null;
  signOut: () => Promise<void>;
  getLatestIdToken: () => Promise<string | null>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  idTokenResult: null,
  signOut: async () => {},
  getLatestIdToken: async () => null,
});

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap your app and make auth object available
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idTokenResult, setIdTokenResult] = useState<IdTokenResult | null>(null);
  const router = useRouter();

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      clearUserFromStorage();
      setUser(null);
      setIdTokenResult(null);
    } catch (err: any) {
      setError(err.message || "Failed to sign out");
    }
  };
  
  // Function to get the latest ID token string
  const getLatestIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) {
      return null;
    }
    try {
      const token = await auth.currentUser.getIdToken(); 
      return token;
    } catch (error) {
      console.error("Error getting ID token:", error);
      await signOut(); 
      return null;
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            const tokenResult = await firebaseUser.getIdTokenResult(true); 
            setIdTokenResult(tokenResult);
            console.log("Auth State Change: User logged in, claims:", tokenResult.claims);
          } catch (err) {
            console.error("Error fetching ID token result:", err);
            setError("Failed to fetch user session details.");
            setIdTokenResult(null);
            await signOut();
          }
        } else {
          setIdTokenResult(null);
          console.log("Auth State Change: User logged out");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
        setUser(null);
        setIdTokenResult(null);
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
    idTokenResult,
    signOut,
    getLatestIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 
"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./firebase-auth-provider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  organizationOnly?: boolean;
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = "/login",
  organizationOnly = true,
}: AuthGuardProps) {
  const { user, loading, idTokenResult } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Use effects only run on the client, so this prevents hydration mismatch errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Wait for auth to initialize
  if (loading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated but we need to check if they belong to an organization (if required)
  if (user) {
    // If organization access is required, check for the custom claim
    if (organizationOnly) {
      const hasOrgClaim = !!idTokenResult?.claims?.organization_id;
      console.log("AuthGuard: Checking org claim:", idTokenResult?.claims, "Result:", hasOrgClaim);
      
      if (!hasOrgClaim) {
        // User is logged in but doesn't have the required organization claim
        return (
          <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center p-4">
            <h2 className="text-xl font-semibold">Organization Access Required</h2>
            <p className="max-w-md text-muted-foreground">
              This content requires an account associated with a registered organization. 
              Your account does not have the necessary organization details.
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Dashboard
            </Button>
          </div>
        );
      }
    }
    
    // User is authenticated and has appropriate access
    return <>{children}</>;
  }

  // User is not authenticated
  if (fallback) {
    // Show fallback content instead of redirecting
    console.log("AuthGuard: User not logged in, showing fallback.");
    return <>{fallback}</>;
  }

  // Redirect to login page with return URL
  console.log("AuthGuard: User not logged in, redirecting to login.");
  const returnUrl = encodeURIComponent(pathname);
  router.push(`${redirectTo}?returnUrl=${returnUrl}`);
  
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
} 
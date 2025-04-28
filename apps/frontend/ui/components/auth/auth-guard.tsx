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
  const { user, loading, isOrganizationUser } = useAuth();
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
    // If organization access is required, check the user's email domain
    if (organizationOnly && !isOrganizationUser(user.email || "")) {
      // User doesn't belong to an organization
      return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center p-4">
          <h2 className="text-xl font-semibold">Organization Access Required</h2>
          <p className="max-w-md text-muted-foreground">
            This content is only available to users with an organization email. Your account is associated with a personal email domain.
          </p>
          <Button onClick={() => router.push('/')}>
            Return to Dashboard
          </Button>
        </div>
      );
    }
    
    // User is authenticated and has appropriate access
    return <>{children}</>;
  }

  // User is not authenticated
  if (fallback) {
    // Show fallback content instead of redirecting
    return <>{fallback}</>;
  }

  // Redirect to login page with return URL
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
"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/auth/firebase-auth-provider"; 
import { FirebaseSignOutButton } from "@/components/auth/firebase-signout-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, User, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function OrganizationPage() {
  return (
    <AuthGuard
      organizationOnly={true}
      fallback={<OrganizationLoginPrompt />}
    >
      <OrganizationDashboard />
    </AuthGuard>
  );
}

function OrganizationLoginPrompt() {
  const [showLoginButton, setShowLoginButton] = useState(false);
  
  // Using useEffect to avoid hydration mismatch
  useEffect(() => {
    setShowLoginButton(true);
  }, []);
  
  if (!showLoginButton) {
    // This temporary content helps avoid hydration mismatch
    return (
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Organization Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-1/2 bg-muted rounded"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent className="h-40 bg-muted rounded"></CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Organization Dashboard</h1>
      <div className="bg-card rounded-lg border p-8 shadow-sm text-center">
        <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Building className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Organization Access Required</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Please sign in with your organization account to access private organization data and settings.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/signup">Create Organization Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrganizationDashboard() {
  const { user, getOrganizationFromEmail } = useAuth();
  const organizationName = getOrganizationFromEmail(user?.email || "") || "Your Organization";
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{organizationName} Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.displayName || user?.email?.split('@')[0]}!</p>
        </div>
        <FirebaseSignOutButton variant="outline" showIcon={true} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Organization Members
            </CardTitle>
            <CardDescription>
              Manage users in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-2">12</p>
            <p className="text-sm text-muted-foreground">Active members</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View Members
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Air Quality Metrics
            </CardTitle>
            <CardDescription>
              Private organization air quality data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-2">28</p>
            <p className="text-sm text-muted-foreground">Monitoring stations</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View Metrics
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Organization Settings
            </CardTitle>
            <CardDescription>
              Manage organization preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[85%]"></div>
              </div>
              <p className="text-sm text-muted-foreground">85% profile complete</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Organization Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 
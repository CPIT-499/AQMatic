"use client";

import { useAuth } from "./firebase-auth-provider";
import { 
  getUserDisplayName, 
  getUserInitials,
} from "@/lib/firebase-user";
import { FirebaseSignOutButton } from "./firebase-signout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Building,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const { user, loading, idTokenResult } = useAuth();
  const router = useRouter();
  
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
        <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    );
  }
  
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const organizationName = idTokenResult?.claims?.organization_name || null; 
  const organizationId = idTokenResult?.claims?.organization_id || null;
  const displayOrganization = organizationName || (organizationId ? `Org ID: ${organizationId}` : null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || ""} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium">{displayName}</span>
            {displayOrganization && (
              <span className="text-xs text-muted-foreground">{displayOrganization}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {organizationId && (
              <p className="text-xs text-muted-foreground">Org ID: {organizationId}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onSelect={() => router.push('/profile')} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        {organizationId ? (
          <DropdownMenuItem asChild>
            <Link href="/organization" className="flex items-center gap-2 cursor-pointer">
              <Building className="h-4 w-4" />
              <span>Organization</span>
            </Link>
          </DropdownMenuItem>
        ) : null }
        <DropdownMenuItem 
          onSelect={() => router.push('/dashboard/settings')} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        {user.emailVerified && (
          <DropdownMenuItem className="flex items-center gap-2 text-green-600 cursor-default">
            <Shield className="h-4 w-4" />
            <span>Verified Account</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="w-full">
            <FirebaseSignOutButton 
              variant="ghost" 
              size="sm" 
              showIcon
              className="w-full justify-start px-2 text-red-600 hover:text-red-700"
            />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "./firebase-auth-provider";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
}

export function FirebaseSignOutButton({ 
  variant = "ghost", 
  size = "sm",
  showIcon = true,
  className
}: SignOutButtonProps) {
  const { signOut } = useAuth();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => signOut()}
      className={cn("gap-1", className)}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      Sign out
    </Button>
  );
} 
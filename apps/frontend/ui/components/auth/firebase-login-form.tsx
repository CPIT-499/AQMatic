"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { signIn, resetPassword, storeUserInStorage } from "@/lib/firebase-auth";
import { auth } from "@/lib/firebase";
import axiosInstance from "@/lib/axios/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the form validation schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  organizationName: z.string().min(1, { message: "Organization name is required" }),
  rememberMe: z.boolean().default(false),
});

export function FirebaseLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      organizationName: "",
      rememberMe: false,
    },
  });

  // Handle password reset
  const handleForgotPassword = async () => {
    const email = form.getValues("email");
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      setError(null);
      setResetSent(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to send password reset email");
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResetSent(false);
    
    try {
      // 1. Sign in with Firebase client-side
      const userCredential = await signIn(values.email, values.password);
      const user = userCredential.user;
      console.log('Firebase Login successful', user);

      // 2. Get the Firebase ID token
      const idToken = await user.getIdToken();
      if (!idToken) {
        throw new Error("Could not retrieve Firebase ID token.");
      }

      // 3. Call backend endpoint to trigger claim setting with organization name
      console.log("Calling backend to set/verify claims...");
      try {
        const response = await axiosInstance.post(
          '/auth/set-claims-trigger', 
          { 
            organization_name: values.organizationName 
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        console.log("Backend claim trigger response:", response.data);
        if (!response.data.success) {
          // Handle organization not found or other errors
          setError(response.data.error || "Failed to set organization.");
          setIsLoading(false);
          return;
        }
      } catch (backendError: any) {
        console.error("Error calling backend claim trigger:", backendError);
        setError(backendError.response?.data?.detail || backendError.message || "Error contacting server.");
        setIsLoading(false);
        return;
      }

      // 4. Store user in local/session storage
      storeUserInStorage(user, values.rememberMe);
            
      // 5. Redirect (AuthProvider will fetch updated claims on refresh/mount)
      console.log(`Redirecting to: ${decodeURIComponent(returnUrl)}`);
      router.push(decodeURIComponent(returnUrl));
      
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = "Failed to login. Please try again.";
      
      // Handle specific Firebase errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {resetSent && (
          <Alert className="bg-green-100 text-green-800 border border-green-200">
            <AlertDescription>Password reset email sent. Please check your inbox.</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="you@example.com" 
                  type="email" 
                  {...field} 
                  autoComplete="email"
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your organization name" 
                  type="text" 
                  {...field} 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  placeholder="••••••••" 
                  type="password" 
                  {...field} 
                  autoComplete="current-password"
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
              </FormItem>
            )}
          />
          
          <Button 
            variant="link" 
            size="sm" 
            className="px-0 font-normal" 
            type="button"
            onClick={handleForgotPassword}
            disabled={isLoading}
          >
            Forgot password?
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link 
            href="/signup" 
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
} 
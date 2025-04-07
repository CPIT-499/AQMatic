'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"; // Assuming Card is handled by parent in page.tsx

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Handle redirect manually
        email,
        password,
      });

      if (result?.error) {
        console.error("SignIn Error:", result.error);
        setError('Invalid email or password. Please try again.');
      } else if (result?.ok) {
        // Redirect to dashboard or home on success
        router.push('/dashboard'); // Or router.push('/');
        router.refresh(); // Refresh server components
      } else {
         setError('An unexpected error occurred.');
      }
    } catch (error) {
      console.error("Login Request Failed:", error);
      setError('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <CardHeader className="p-0 pb-4"> {/* Adjust padding if needed */}
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <CardFooter className="p-0 pt-4"> {/* Adjust padding if needed */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </CardFooter>
    </form>
  );
} 
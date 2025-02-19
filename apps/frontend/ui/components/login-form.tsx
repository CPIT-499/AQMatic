'use client';

import { useState } from "react"
import { useForm } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, LoginCredentials } from "@/lib/api"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginCredentials>()

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setError(null)
      const response = await login(data)
      // Handle successful login (e.g., store token, redirect)
      console.log('Login successful:', response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6 transition-all duration-300 ease-in-out", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center transition-all duration-300 ease-in-out">
        <h1 className="text-2xl font-bold transition-all duration-300 ease-in-out hover:scale-[1.02]">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground transition-all duration-300 ease-in-out">
          Enter your email below to login to your account
        </p>
      </div>
      {error && (
        <div className="text-sm text-red-500 text-center transition-all duration-300 ease-in-out">
          {error}
        </div>
      )}
      <div className="grid gap-6">
        <div className="grid gap-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="email" className="transition-all duration-300 ease-in-out hover:text-primary">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            disabled={isSubmitting}
            className="transition-all duration-300 ease-in-out focus:scale-[1.01] hover:border-primary/50"
          />
        </div>
        <div className="grid gap-2 transition-all duration-300 ease-in-out">
          <div className="flex items-center">
            <Label htmlFor="password" className="transition-all duration-300 ease-in-out hover:text-primary">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm transition-all duration-300 ease-in-out underline-offset-4 hover:underline hover:text-primary hover:scale-105"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            {...register('password', { required: true })}
            disabled={isSubmitting}
            className="transition-all duration-300 ease-in-out focus:scale-[1.01] hover:border-primary/50"
          />
        </div>
        <Button type="submit" className="w-full transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </div>
      <div className="text-center text-sm transition-all duration-300 ease-in-out">
        Don&apos;t have an account?{" "}
        <a href="#" className="transition-all duration-300 ease-in-out underline underline-offset-4 hover:text-primary hover:scale-105 inline-block">
          Sign up
        </a>
      </div>
    </form>
  )
}

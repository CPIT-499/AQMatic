'use client';

import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-b from-emerald-950/10 via-emerald-900/5 to-background backdrop-blur-[200px] transition-all duration-500 ease-in-out">
        <div className="flex justify-center gap-2 md:justify-start">
          <a 
            href="/" 
            className="flex items-center gap-2 font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:text-primary"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition-all duration-300 ease-in-out hover:bg-primary/90 hover:shadow-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            AQMatic
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs bg-card/40 p-6 rounded-lg shadow-lg border border-emerald-900/15 backdrop-blur-xl transition-all duration-300 ease-in-out hover:bg-card/50 hover:border-emerald-900/20 hover:shadow-xl hover:scale-[1.01]">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block bg-gradient-to-t from-emerald-900/10 via-emerald-950/5 to-transparent backdrop-blur-xl transition-all duration-500 ease-in-out">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale transition-all duration-500 hover:brightness-105"
        />
      </div>
    </div>
  )
}
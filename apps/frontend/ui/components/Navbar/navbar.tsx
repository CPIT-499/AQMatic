"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Make sure this is imported
import { UserProfile } from "@/components/auth/user-profile"; // Import UserProfile

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme, resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Ensure dark mode class is applied on page load
  useEffect(() => {
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [resolvedTheme]);

  // Only compute nav classes on the client after mounting
  const navClasses = mounted ? 
    scrolled ? 
      "bg-background/40 backdrop-blur-md border border-border/50" : 
      "bg-background/40 backdrop-blur-md border border-border/50"
    : "bg-background/40 backdrop-blur-md border border-border/50"; // Use consistent styling for unmounted state too

  // Create theme-specific hover effects
  const hoverClasses = resolvedTheme === "dark"
    ? "hover:bg-accent/80 hover:shadow-md" // Dark mode hover effect
    : "hover:bg-accent/80 hover:shadow-md"; // Light mode hover effect with shadow

  return (
    <div className="w-full flex justify-center p-4 md:p-6 sticky top-0 z-20">
      <nav 
        className={cn(
          "w-full max-w-5xl rounded-full px-4 md:px-7 py-2 flex items-center justify-between transition-all duration-300",
          navClasses,
          hoverClasses // Apply theme-specific hover effects
        )}
      >
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            {/* Light mode logo */}
            <Image
            src="/PNG_version.png"
            alt="AQMatic Logo Light"
            width={30}
            height={30}
            className="dark:hidden"
            />
            {/* Dark mode logo */}
            <Image
            src="/PNG_version_dark.png"
            alt="AQMatic Logo Dark"
            width={30}
            height={30}
            className="hidden dark:block"
            />
            <span className="text-lg font-semibold hidden sm:inline">AQMatic</span>
          </Link>
        </div>
        
        {/* Navigation Links - kept simple for now */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" asChild>
             <Link href="/contact">Contact</Link>
          </Button>
        </div>

        {/* Right side: User Profile and Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* UserProfile component handles login/signup/user info */}
          {mounted && <UserProfile />} 
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && (
              <>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </>
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        
        {/* Mobile Menu Toggle (functionality not implemented here) */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-9 w-9 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <span className="sr-only">Toggle menu</span>
        </Button>
      </nav>
    </div>
  );
}
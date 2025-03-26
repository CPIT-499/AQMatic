"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Make sure this is imported

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
      const isScrolled = window.scrollY > 10;
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
    scrolled ? "bg-background/40 backdrop-blur-md border border-border/50" :
    resolvedTheme === "dark" ? "bg-background/40 backdrop-blur-md border border-border/50" :
    "bg-[#eaeaea] hover:bg-[#ffffff] backdrop-blur-md border border-border" 
    : "bg-transparent"; // Default during server rendering

  return (
    <div className="w-full flex justify-center p-9 sticky top-0% z-20">
      <nav 
        className={cn(
          "w-full max-w-3xl rounded-full px-7 py-2 flex items-center justify-between transition-all duration-300",
          navClasses
        )}
      >
        <div className="flex items-center grid-flow-row gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl">AQMatic</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/about" 
            className="px-4 py-2 rounded-full hover:bg-accent hover:backdrop-blur-md transition-colors duration-300"
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className="px-4 py-2 rounded-full hover:bg-accent hover:backdrop-blur-md transition-colors duration-300"
          >
            Contact
          </Link>
          <Link href="/login">
            <Button 
              className="px-6 py-2 rounded-full hover:backdrop-blur-md transition-colors duration-300"
            >
              Log in
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
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
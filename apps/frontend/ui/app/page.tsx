'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "../components/ui/button";
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowMap(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-background relative">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b z-50 py-2">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">AQMatic</h1>
          <div className="flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">About</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[200px]">
                      <p className="text-sm">Air Quality Monitoring System</p>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" className="text-sm">Contact</Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Welcome to AQMatic</h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">Monitor air quality in real-time with our advanced tracking system</p>
          <Button size="lg" onClick={() => {
            router.push('/login');
          }}>Get Started</Button>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-screen relative">
        <div className="absolute top-0 left-0 right-0 h-42 bg-gradient-to-b from-background to-transparent z-10"></div>
        <div className="container mx-auto px-6 py-8 h-full">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 transition-opacity duration-600" style={{ opacity: showMap ? 1 : 0, pointerEvents: showMap ? 'auto' : 'none' }}>
              <MapComponent className="w-full h-full rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
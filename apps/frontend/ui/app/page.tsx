'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

import { Toolbar } from 'primereact/toolbar';
import { Button } from "../components/ui/button";
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

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

  const startContent = (
    <h1 className="text-2xl font-bold text-primary">AQMatic</h1>
  );

  const endContent = (
    <div className="flex items-center gap-4">
      <Button variant="ghost" className="text-sm" onClick={() => router.push('/about')}>About</Button>
      <Button variant="ghost" className="text-sm">Contact</Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </Button>
    </div>
  );

  return (
    <main className="min-h-screen bg-background relative bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4">
          <Toolbar 
            start={startContent} 
            end={endContent} 
            className="border-none bg-transparent py-4" 
            style={{
              '--toolbar-bg': 'transparent',
              '--toolbar-border': 'none',
              '--toolbar-padding': '1rem',
              '--toolbar-content-spacing': '1.5rem'
            }}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center text-center px-4 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Welcome to AQMatic</h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">Monitor air quality in real-time with our advanced tracking system</p>
          <Button size="lg" onClick={() => {
            router.push('/login');
          }}>Get Started</Button>
        </div>
      </section>

      {/* Map Section */}
      <section className="min-h-screen pt-16 pb-16 relative bg-gradient-to-t from-primary/5 via-transparent to-transparent">
        <div className="container mx-auto px-6 py-8 h-[calc(100vh-8rem)] z-0">
          <div className="relative w-full h-full bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="absolute inset-0 transition-opacity duration-600" style={{ opacity: showMap ? 1 : 0, pointerEvents: showMap ? 'auto' : 'none' }}>
              <MapComponent className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
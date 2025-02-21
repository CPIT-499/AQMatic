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

interface CustomCSSProperties extends React.CSSProperties {
    '--toolbar-bg'?: string;
    '--toolbar-border'?: string;
    '--toolbar-padding'?: string;
    '--toolbar-content-spacing'?: string;
}

const toolbarStyle: CustomCSSProperties = {
  '--toolbar-bg': 'transparent',
  '--toolbar-border': 'none',
  '--toolbar-padding': '1rem',
  '--toolbar-content-spacing': '1.5rem'
};

export default function Home() {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowMap(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const startContent = (
    <h1 className="text-2xl font-bold text-primary transition-all duration-300 ease-in-out">AQMatic</h1>
  );

  const endContent = (
    <div className="flex items-center gap-4">
      <Button variant="ghost" className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10" onClick={() => router.push('/about')}>About</Button>
      <Button variant="ghost" className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10">Contact</Button>
      <Button variant="ghost" className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10">Sign in</Button>
      <Button variant="ghost" className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10">log in</Button>
      <Button
        variant="ghost"
        size="icon"
        className="transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <span suppressHydrationWarning>
          {mounted ? (theme === "light" ? <Moon size={20} /> : <Sun size={20} />) : null}
        </span>
      </Button>
    </div>
  );

  return (
    <main className="min-h-screen relative bg-gradient-to-b from-background via-background/80 to-background/60 backdrop-blur-[100px]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-background/10 backdrop-blur-lg border-b border-border/20 z-50 transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4">
          <Toolbar 
            start={startContent} 
            end={endContent} 
            className="border-none bg-transparent py-4" 
            style={toolbarStyle}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center text-center px-4 bg-gradient-to-b from-background/5 via-background/5 to-transparent backdrop-blur-md transition-all duration-700 ease-in-out">
        <div className="transition-all duration-500 ease-in-out">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 transition-all duration-500 ease-in-out">
        Welcome to <span className="transition-all duration-500 ease-in-out hover:text-primary/90">AQMatic</span>
        </h1>
        
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 transition-all duration-500 ease-in-out hover:text-foreground">Monitor air quality in real-time with our advanced tracking system</p>
          <Button size="lg" className="transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-primary/90" onClick={() => {
            router.push('/login');
          }}>Get Started</Button>
        </div>
      </section>

      {/* Map Section */}
      <section className="min-h-screen pt-16 pb-16 relative bg-gradient-to-t from-background/5 via-background/5 to-transparent backdrop-blur-md transition-all duration-700 ease-in-out">
        <div className="container mx-auto px-6 py-8 h-[calc(100vh-8rem)] z-0">
          <div className="relative w-full h-full bg-card/50 rounded-lg shadow-lg overflow-hidden border border-border/10 transition-all duration-500 ease-in-out hover:shadow-xl hover:border-border/20">
            <div
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                opacity: showMap ? 1 : 0,
                pointerEvents: showMap ? 'auto' : 'none',
                transform: showMap ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              <MapComponent className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
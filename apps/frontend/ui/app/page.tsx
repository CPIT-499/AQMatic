'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MapHomeStyles from '@/components/MapComponent/MapHome.module.css'; // adjust import as needed
import navStyles from '@/components/Nav/Nav.module.css';
import Navbar from "@/components/Navbar/navbar"

const MapComponent = dynamic(() => import('../components/MapComponent/MapComponent'), { ssr: false });

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
    <h1 className="text-2xl font-bold text-primary transition-all duration-300 ease-in-out">
      AQMatic
    </h1>
  );

  const endContent = (
    <div className="flex items-center gap-4">
      <Button variant="ghost" className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10" onClick={() => router.push('/about')}>
        About
      </Button>
      <Button variant="ghost" className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10">
        Contact
      </Button>
      <Button variant="ghost" className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10">
        Sign in
      </Button>
      <Button variant="ghost" className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10">
        Log in
      </Button>
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
    <main className="min-h-screen relative bg-gradient-to-b from-background via-background/80 to-background/60 backdrop-blur-[100px] dark:bg-black">
      {/* green Blure background */}
      <div className="absolute top-60 left-1/4 w-1/2 h-64 bg-green-300/20 blur-[100px] rounded-full pointer-events-none" />
  
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-16 pb-24 text-center dark:text-white">
        <div className="mx-auto mb-10 flex justify-center">
          <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="h-8 w-8 relative inset-0">
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-gray-800 dark:bg-gray-300"></div>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
          Monitor air quality insights
          <br />
          in real-time.
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
          Supporting Saudi Vision 2030 sustainability goals with comprehensive air monitoring.
          Connect sensors, track emissions, and access real-time environmental insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="px-6 py-2 rounded-full hover:backdrop-blur-md transition-colors duration-300">Join for free</Button>
          <Button
            variant="outline"
            className="px-6 py-2 rounded-full hover:backdrop-blur-md transition-colors duration-300"
          >
            See our plans <span className="ml-2">→</span>
          </Button>
        </div>
      </main>

      {/* Map Section */}
      <section className={MapHomeStyles.mapSection}>
        <div className={MapHomeStyles.container}>
          <div className={MapHomeStyles.mapCard}>
            <div className={`${MapHomeStyles.mapWrapper} ${showMap ? MapHomeStyles.mapVisible : MapHomeStyles.mapHidden}`}>
              <MapComponent className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
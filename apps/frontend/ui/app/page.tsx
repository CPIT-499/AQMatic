"use client";

import Navbar from "@/components/Navbar/navbar";
import { BackgroundAnimation } from "../components/Home/BackgroundAnimation";
import { HeroSection } from "../components/Home/HeroSection";
import { MapSection } from "../components/Home/MapSection";
import { SupportersSection } from "../components/Home/SupportersSection";
import { Footer } from "../components/Home/Footer";
import { FloatingActionButton } from "../components/Home/FloatingActionButton"; // Updated import name
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();

  // Define navigation handlers
  const handleGetStarted = () => {
    // Navigate to the sign-up or registration page
    router.push('/signup'); // Example route
  };

  const handleSeePlans = () => {
    // Navigate to the pricing or plans page
    router.push('/pricing'); // Example route
  };

  const handleDashboardLink = () => {
    router.push("/dashboard"); // Keep existing dashboard navigation
  };

  const handleFooterLink = (link: string) => {
    // Define navigation logic for footer links
    // Example: Convert link text to a slug-like path
    const path = `/${link.toLowerCase().replace(/\s+/g, '-')}`;
    console.log(`Navigating to footer link: ${path}`); // Keep log for debugging if needed
    router.push(path); // Navigate to the generated path
  };

  const handleMobileCTA = () => {
    // Navigate to the same place as "Get Started"
    router.push('/signup'); // Example route matching Get Started
  };


  return (
    <main className="min-h-screen relative bg-gradient-to-b from-background via-background/80 to-background/60 backdrop-blur-[100px] dark:bg-black">
      {/* Enhanced Flowing Animated Gradients */}
      <BackgroundAnimation />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        onGetStartedClick={handleGetStarted}
        onSeePlansClick={handleSeePlans}
      />

      {/* Map Section */}
      <MapSection onDashboardLinkClick={handleDashboardLink} />

      {/* Company Supporters Section */}
      <SupportersSection />

      {/* Footer */}
      <Footer onLinkClick={handleFooterLink} />

      {/* Add a floating mobile CTA */}
      <FloatingActionButton onClick={handleMobileCTA} /> {/* Updated component usage */}
    </main>
  );
}
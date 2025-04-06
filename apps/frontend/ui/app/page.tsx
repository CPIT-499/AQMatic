"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MapHomeStyles from "@/components/MapComponent/MapHome.module.css";
import Navbar from "@/components/Navbar/navbar";
import { Logo } from "@/components/logo";
import Link from "next/link";
import Image from "next/image";

const MapComponent = dynamic(
  () => import("../components/MapComponent/MapComponent"),
  { ssr: false }
);

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, Moon, Sun, Cpu, Lock, Sparkles, Zap } from "lucide-react";

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "#contact" },
];

export default function Home() {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();
  const [menuState, setMenuState] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowMap(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const endContent = (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10"
        onClick={() => router.push("/about")}
      >
        About
      </Button>
      <Button
        variant="ghost"
        className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10"
      >
        Contact
      </Button>
      <Button
        variant="ghost"
        className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10"
      >
        Sign in
      </Button>
      <Button
        variant="ghost"
        className="text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10"
      >
        Log in
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/10"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        <span suppressHydrationWarning>
          {mounted ? (
            theme === "light" ? (
              <Moon size={20} />
            ) : (
              <Sun size={20} />
            )
          ) : null}
        </span>
      </Button>
    </div>
  );

  return (
    <main className="min-h-screen relative bg-gradient-to-b from-background via-background/80 to-background/60 backdrop-blur-[100px] dark:bg-black">
      {/* Enhanced Flowing Animated Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/3 -left-1/2 w-full h-full bg-gradient-to-br from-green-400/50 via-emerald-500/30 to-transparent rounded-full blur-[120px] animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/2 w-2/3 h-2/3 bg-gradient-to-tr from-blue-400/30 via-sky-500/20 to-transparent rounded-full blur-[80px] animate-[float_15s_ease-in-out_infinite_alternate]" />
        <div className="absolute -bottom-1/3 -right-1/3 w-full h-full bg-gradient-to-tl from-slate-400/30 via-gray-500/20 to-transparent rounded-full blur-[100px] animate-[float_25s_ease-in-out_infinite_reverse]" />

        {/* Air particle effect */}
        <div className="absolute inset-0 bg-noise-pattern opacity-[0.03] mix-blend-soft-light"></div>
      </div>
      {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo Icon */}
            <div className="mx-auto mb-6">
          <Card className="w-32 h-32 mx-auto bg-card/50 backdrop-blur-sm flex items-center justify-center overflow-hidden">
            {/* Light mode logo */}
            <Image 
              src="/PNG_version.png" 
              alt="AQMatic Logo" 
              width={100} 
              height={100}
              className="dark:hidden" 
            />
            {/* Dark mode logo */}
            <Image 
              src="/PNG_version_dark.png" 
              alt="AQMatic Logo" 
              width={100} 
              height={100}
              className="hidden dark:block" 
            />
          </Card>
            </div>

          {/* Hero Content */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-800 dark:from-green-400 dark:to-emerald-200 animate-gradient">
            Monitor air quality insights
            <br />
            in real-time.
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Supporting Saudi Vision 2030 sustainability goals with comprehensive
            air monitoring. Connect sensors, track emissions, and make
            data-driven decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="px-6 py-5 rounded-full bg-gradient-to-r from-green-600 to-emerald-800 dark:from-green-400 dark:to-emerald-700 hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Get started for free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-6 py-5 rounded-full border-2 hover:bg-accent/50 transition-all group"
            >
              See our plans{" "}
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Button>
          </div>

          {/* Feature Section - Compact */}
          <div className="mb-8 mt-60">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-semibold mb-4">
                Built for Scaling Teams
              </h2>
              <p className="text-base mb-6">
                Empower your team with workflows that adapt to your needs.
              </p>

              <div className="relative rounded-xl overflow-hidden mb-8">
                <Image
                  src="/dashboard.png"
                  className="w-full dark:hidden"
                  alt="Dashboard preview"
                  width={1200}
                  height={600}
                />
                <Image
                  src="/dashboard_dark.png"
                  className="w-full hidden dark:block"
                  alt="Dashboard preview dark"
                  width={1200}
                  height={600}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                {[
                  {
                    icon: <Zap className="size-4" />,
                    title: "Fast",
                    desc: "Lightning quick data processing",
                  },
                  {
                    icon: <Cpu className="size-4" />,
                    title: "Powerful",
                    desc: "Advanced analytics capabilities",
                  },
                  {
                    icon: <Lock className="size-4" />,
                    title: "Secure",
                    desc: "Enterprise-grade security",
                  },
                  {
                    icon: <Sparkles className="size-4" />,
                    title: "AI Powered",
                    desc: "Intelligent insights & predictions",
                  },
                ].map((item, i) => (
                  <div key={i} className="space-y-1 p-3 hover:bg-accent/20 rounded-lg transition-all">
                    <div className="flex items-center gap-2">
                      <div className="text-primary p-1 rounded-md bg-primary/10">
                        {item.icon}
                      </div>
                      <h3 className="text-sm font-medium">{item.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-10 relative">
        <div className="container mx-auto px-9"></div>
          <div className="text-center mb-7">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Air Quality Map
        </h2>
        <p className="text-lg text-muted-foreground max-w-6xl mx-auto">
          Explore real-time air quality data across Saudi Arabia with our
          interactive map
        </p>
          </div>

          <div className="rounded-xl overflow-hidden border border-border/80 shadow-xl bg-card/50 backdrop-blur-sm" style={{ height: '500px', width: '80%', margin: '0 auto' }}>
        

        <div>
          <MapComponent className="w-half h-half" />
        </div>
          </div>

          <div className="mt-6 text-center">
        <Button
          variant="link"
          onClick={() => router.push("/dashboard")}
          className="text-primary"
        >
          Access full dashboard <span className="ml-5">→</span>
        </Button>
          </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Trusted by Environmental Leaders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "AQMatic has revolutionized how we monitor air quality in our industrial zones.",
                author: "Dr. Mohammed Al-Farsi",
                title: "Environmental Director, Ministry of Environment",
              },
              {
                quote:
                  "The real-time data helps us make immediate decisions to protect public health.",
                author: "Sarah Al-Qahtani",
                title: "Urban Planning Director, Riyadh Municipality",
              },
              {
                quote:
                  "Integrating with our existing sensors was seamless. Impressive platform.",
                author: "Ahmed Al-Otaibi",
                title: "CTO, Saudi Green Initiative",
              },
            ].map((testimonial, i) => (
              <Card
                key={i}
                className="p-8 bg-background border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="text-4xl text-primary/20 mb-4"></div>
                <p className="italic mb-6 text-foreground/80">
                  {testimonial.quote}
                </p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.title}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">AQMatic</h3>
              <p className="text-muted-foreground text-sm">
                Supporting Saudi Vision 2030 with advanced environmental
                monitoring solutions.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 AQMatic. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add a floating mobile CTA */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button className="rounded-full shadow-lg bg-primary text-primary-foreground">
          Get Started
        </Button>
      </div>
    </main>
  );
}
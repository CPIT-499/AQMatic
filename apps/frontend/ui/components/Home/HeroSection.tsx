"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Cpu, Lock, Sparkles, Zap } from "lucide-react";

const features = [
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
];

interface HeroSectionProps {
  onGetStartedClick: () => void;
  onSeePlansClick: () => void;
}

export function HeroSection({ onGetStartedClick, onSeePlansClick }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 relative z-10">
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



        {/* Feature Section - Compact */}
        <div className="mb-8 mt-60">
          <div className="max-w-5xl mx-auto">

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
              {features.map((item, i) => (
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
  );
}

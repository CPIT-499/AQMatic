"use client";

import Navbar from "@/components/Navbar/navbar";
import { BackgroundAnimation } from "../../components/Home/BackgroundAnimation";
import { Footer } from "../../components/Home/Footer";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function About() {
  const router = useRouter();

  const handleFooterLink = (link: string) => {
    const path = `/${link.toLowerCase().replace(/\s+/g, '-')}`;
    console.log(`Navigating to footer link: ${path}`);
    router.push(path);
  };

  return (
    <main className="min-h-screen relative bg-gradient-to-b from-background via-background/80 to-background/60 backdrop-blur-[100px] dark:bg-black">
      {/* Enhanced Flowing Animated Gradients */}
      <BackgroundAnimation />

      {/* Navbar */}
      <Navbar />

      {/* About Content */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            About AQMatic
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            An innovative Environmental Monitoring Platform for Saudi Arabia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
          <div className="flex items-center justify-center">
            <div className="relative w-[300px] h-[300px]">
              <Image 
                src="/PNG_version.png"
                alt="AQMatic Logo"
                fill
                className="object-contain dark:hidden glow-effect"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(72, 255, 72, 0.5))"
                }}
              />
              <Image 
                src="/PNG_version_dark.png"
                alt="AQMatic Logo"
                fill
                className="object-contain hidden dark:block glow-effect"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(72, 255, 72, 0.5))"
                }}
              />
            </div>
          </div>
          
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-lg leading-relaxed">
              <p className="mb-4">
                AQMatic addresses the growing need for quality environmental data in Saudi Arabia.
                Our mission is to provide real-time air quality monitoring with advanced analytics to
                enhance public health, ensure regulatory compliance, and promote sustainability across the Kingdom.
              </p>
              <p>
                This initiative directly supports Vision 2030's environmental goals by providing actionable
                insights for both officials and citizens.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 transform transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-center text-primary">Strategic Deployment</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>Network of stationary and vehicle-mounted sensors strategically placed for comprehensive coverage</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 transform transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-center text-primary">Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>Real-time monitoring with predictive capabilities powered by advanced machine learning algorithms</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 transform transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-center text-primary">Actionable Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>Data-driven recommendations for officials and citizens to make informed decisions</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer onLinkClick={handleFooterLink} />
    </main>
  );
}
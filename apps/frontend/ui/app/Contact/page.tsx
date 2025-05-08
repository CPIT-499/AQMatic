"use client";

import Navbar from "@/components/Navbar/navbar";
import { BackgroundAnimation } from "../../components/Home/BackgroundAnimation";
import { Footer } from "../../components/Home/Footer";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";

export default function Contact() {
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

      {/* Contact Content */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We'd love to hear from you. Reach out with any questions or collaborations.
          </p>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="relative w-[200px] h-[200px]">
            <Image 
              src="/PNG_version.png"
              alt="AQMatic Logo"
              fill
              className="object-contain dark:hidden"
              style={{
                filter: "drop-shadow(0 0 10px rgba(72, 255, 72, 0.5))"
              }}
            />
            <Image 
              src="/PNG_version_dark.png"
              alt="AQMatic Logo"
              fill
              className="object-contain hidden dark:block"
              style={{
                filter: "drop-shadow(0 0 10px rgba(72, 255, 72, 0.5))"
              }}
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-2">Email Us</h3>
                  <div className="space-y-2">
                    <p>
                      <a href="mailto:abdul.almutlaq@hotmail.com" className="text-blue-600 hover:underline">
                        abdul.almutlaq@hotmail.com
                      </a>
                      <span className="block text-sm text-muted-foreground">
                        Abdulmohsen Ahmed Almutlaq
                      </span>
                    </p>
                    <p>
                      <a href="mailto:osamayalghamdi@gmail.com" className="text-blue-600 hover:underline">
                        osamayalghamdi@gmail.com
                      </a>
                      <span className="block text-sm text-muted-foreground">
                        Osama Yasser Alghamdi
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-2">Call Us</h3>
                  <a>Abdulmohsen Ahmed Almutlaq</a>
                    <a href="tel:+966554498465" className="text-blue-600 hover:underline"> +966 55 449 8465</a><br/>
                    <a>Osama Yasser Alghamdi</a>
                    <a href="tel:+966567682061" className="text-blue-600 hover:underline"> +966 56 768 2061</a>
                  <p className="text-sm text-muted-foreground mt-1"></p>
                </div>
              </div>
            </Card>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onLinkClick={handleFooterLink} />
    </main>
  );
}
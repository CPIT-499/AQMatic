"use client";

import dynamic from "next/dynamic";
import { Button } from "../ui/button";
// Remove useRouter import if no longer needed directly here
// import { useRouter } from "next/navigation";

const MapComponent = dynamic(
  () => import("../MapComponent/MapComponent"),
  { ssr: false }
);

interface MapSectionProps {
    onDashboardLinkClick: () => void;
}

export function MapSection({ onDashboardLinkClick }: MapSectionProps) {
  // Remove router initialization if not used elsewhere in this component
  // const router = useRouter();

  return (
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

      <div className="rounded-xl overflow-hidden border border-border/80 shadow-xl bg-card/50 backdrop-blur-sm" style={{ height: '750px', width: '70%', margin: '0 auto' }}>
        <div style={{ width: '100%', height: '100%' }}>
          <MapComponent className="w-full h-full" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button
          variant="link"
          onClick={onDashboardLinkClick} // Use prop handler
          className="text-primary"
        >
          Access full dashboard <span className="ml-5">→</span>
        </Button>
      </div>
    </section>
  );
}

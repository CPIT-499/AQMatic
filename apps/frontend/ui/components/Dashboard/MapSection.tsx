import * as React from "react";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";

// Dynamically import map component with no server-side rendering
const MapComponentNoSSR = dynamic(
  () => import('@/components/MapComponent/MapComponent'), // Adjust path if needed
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading Map...</div> } // Optional loading state
);

export function MapSection() {
  return (
    <section className="col-span-1">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full flex flex-col">
        {/* Card Header */}
        <div className="flex flex-row items-center justify-between p-4 pb-2 border-b">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Monitoring Locations
            </h3>
            <p className="text-sm text-muted-foreground">
              Real-time air quality across stations
            </p>
          </div>
          <div>
            {/* Consider making this button functional if needed */}
            <Button variant="outline" size="sm" className="text-xs pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Live Data
            </Button>
          </div>
        </div>
        {/* Map Container */}
        <div className="flex-grow h-[350px] w-full"> {/* Use flex-grow to fill remaining space */}
          <MapComponentNoSSR className="w-full h-full" />
        </div>
      </div>
    </section>
  );
}
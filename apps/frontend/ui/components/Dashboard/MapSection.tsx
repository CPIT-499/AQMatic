import * as React from "react";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react"; // Import Activity icon for the button

// Dynamically import map component with no server-side rendering
const MapComponentNoSSR = dynamic(
  () => import('@/components/MapComponent/MapComponent'), // Adjust path if needed
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading Map...</div> } // Optional loading state
);

// Define props type for MapSection
interface MapSectionProps {
  data: any[]; // Define a more specific type based on your map data structure
}

export function MapSection({ data }: MapSectionProps) {
  return (
    <section className="col-span-1 lg:col-span-1 h-full">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full flex flex-col">
        {/* Card Header */}
        <div className="flex flex-row items-center justify-between space-x-4 p-6 pb-4 border-b">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Monitoring Locations
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Real-time air quality across stations
            </p>
          </div>
          <div>
            <Button variant="outline" size="sm" className="h-8 px-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Live Data</span>
            </Button>
          </div>
        </div>
        {/* Map Container */}
        <div className="flex-1 min-h-[500px] w-full">
          <MapComponentNoSSR className="w-full h-full" data={data} />
        </div>
      </div>
    </section>
  );
}
"use client";

import dynamic from "next/dynamic";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { fetchMapData } from "@/services/api/fetchMapData";
import { Loader2 } from "lucide-react";

interface MapDataPoint {
  latitude: number;
  longitude: number;
  intensity?: number | null;
  city?: string;
  region?: string;
  pm25?: number | null;
  pm10?: number | null;
  o3?: number | null;
  no2?: number | null;
  so2?: number | null;
  co?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  wind_speed?: number | null;
}

const MapComponent = dynamic(
  () => import("../MapComponent/MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
);

interface MapSectionProps {
  onDashboardLinkClick: () => void;
}

export function MapSection({ onDashboardLinkClick }: MapSectionProps) {
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMapData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMapData("public", null);
        if (data && Array.isArray(data)) {
          setMapData(data);
        } else {
          console.error(
            "Received unexpected data format from fetchMapData:",
            data
          );
          setError("Failed to load map data: Invalid format.");
          setMapData([]);
        }
      } catch (err: any) {
        console.error("Error fetching map data for home page:", err);
        setError(err.message || "Failed to load map data.");
        setMapData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMapData();
  }, []);

  return (
    <section className="py-10 relative">
      <div className="text-center mb-7">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Air Quality Map
        </h2>
        <p className="text-lg text-muted-foreground max-w-6xl mx-auto">
          Explore real-time air quality data across Saudi Arabia with our
          interactive map
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden border border-border/80 shadow-xl bg-card/50 backdrop-blur-sm relative"
        style={{ height: "750px", width: "70%", margin: "0 auto" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-10 p-4">
            <p className="text-destructive-foreground text-center">
              Error loading map: {error}
            </p>
          </div>
        )}
        <div
          style={{ width: "100%", height: "100%" }}
          className={isLoading || error ? "opacity-50" : ""}
        >
          <MapComponent className="w-full h-full" data={mapData} />
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button
          variant="link"
          onClick={onDashboardLinkClick}
          className="text-primary"
        >
          Access full dashboard <span className="ml-5">→</span>
        </Button>
      </div>
    </section>
  );
}

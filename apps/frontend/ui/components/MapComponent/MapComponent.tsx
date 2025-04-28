'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Define the expected structure of the data points passed via props
interface MapDataPoint {
  latitude: number;
  longitude: number;
  intensity?: number | null; // Intensity for heatmap (e.g., AQI normalized 0-1)
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

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  className?: string;
  data: MapDataPoint[]; // Add data prop
}

const MapComponent = ({ className, data }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Define Saudi Arabia bounds [south-west, north-east]
    const saudiBounds = L.latLngBounds(
      [16.3478, 34.6206], // South West
      [32.1480, 55.6666]  // North East
    );

    // Initialize the map with custom options
    const map = L.map(mapRef.current, {
      center: [23.8859, 45.0792],
      zoom: 6,
      zoomControl: false,
      scrollWheelZoom: true,
      fadeAnimation: true,
      maxBounds: saudiBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 5,
      maxZoom: 19
    });
    
    mapInstanceRef.current = map;

    // Ensure the map stays within bounds when zooming
    map.fitBounds(saudiBounds, { maxZoom: 200 });

    // Add zoom control to top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Add a modern-looking tile layer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©StadiaMaps',
      maxZoom: 20,
      minZoom: 5
    }).addTo(map);

    // Add a scale control
    L.control.scale({
      imperial: false,
      position: 'bottomright'
    }).addTo(map);

    // Create empty heat layer
    // @ts-expect-error - leaflet.heat type definitions
    heatLayerRef.current = L.heatLayer([], {
      radius: 30,
      blur: 20,
      maxZoom: 15,
      max: 1.0,
      minOpacity: 0.4,
      gradient: {
        0.2: '#00e400', // Good
        0.4: '#ffff00', // Moderate
        0.6: '#ff7e00', // Unhealthy for Sensitive Groups
        0.8: '#ff0000', // Unhealthy
        0.9: '#99004c', // Very Unhealthy
        1.0: '#7e0023'  // Hazardous
      }
    }).addTo(map);

    // Create a layer group for markers
    markersRef.current = L.layerGroup().addTo(map);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Function to get marker color based on AQI intensity
  const getMarkerColor = (intensity: number | null | undefined) => { // Adjusted type to include undefined
    if (intensity === null || intensity === undefined) return '#808080'; // Gray for no data
    if (intensity <= 0.2) return '#00e400';   // Good
    if (intensity <= 0.4) return '#ffff00';   // Moderate
    if (intensity <= 0.6) return '#ff7e00';   // Unhealthy for Sensitive Groups
    if (intensity <= 0.8) return '#ff0000';   // Unhealthy
    if (intensity <= 0.9) return '#99004c';   // Very Unhealthy
    return '#7e0023';                         // Hazardous
  };

  // Function to create marker icon
  const createMarkerIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  // Update map data whenever the 'data' prop changes
  useEffect(() => {
    // Ensure map instance and layers are initialized, and data is present
    if (!mapInstanceRef.current || !data || !heatLayerRef.current || !markersRef.current) {
      console.log("MapComponent: Skipping update (map instance or data not ready)");
      return;
    }

    const map = mapInstanceRef.current;

    try {
      console.log("MapComponent: Updating map layers with new data", data.length);
      // Update heatmap
      const heatmapData = data.map(point => [point.latitude, point.longitude, point.intensity || 0]);
      heatLayerRef.current.setLatLngs(heatmapData);

      // Update markers
      markersRef.current.clearLayers();
      
      data.forEach((point: MapDataPoint) => {
        const color = getMarkerColor(point.intensity);
        const marker = L.marker([point.latitude, point.longitude], {
          icon: createMarkerIcon(color)
        });

        // Create popup content (ensure robustness against missing data)
        const popupContent = `
          <div style="min-width: 180px; font-family: sans-serif; font-size: 13px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${point.city || 'Unknown Location'}${point.region ? `, ${point.region}` : ''}</h3>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 8px;">
              ${point.pm25 !== null && point.pm25 !== undefined ? `<div>PM2.5:</div><div style="font-weight: 500;">${point.pm25.toFixed(1)} µg/m³</div>` : ''}
              ${point.pm10 !== null && point.pm10 !== undefined ? `<div>PM10:</div><div style="font-weight: 500;">${point.pm10.toFixed(1)} µg/m³</div>` : ''}
              ${point.o3 !== null && point.o3 !== undefined ? `<div>O3:</div><div style="font-weight: 500;">${point.o3.toFixed(1)} ppb</div>` : ''}
              ${point.no2 !== null && point.no2 !== undefined ? `<div>NO2:</div><div style="font-weight: 500;">${point.no2.toFixed(1)} ppb</div>` : ''}
              ${point.so2 !== null && point.so2 !== undefined ? `<div>SO2:</div><div style="font-weight: 500;">${point.so2.toFixed(1)} ppb</div>` : ''}
              ${point.co !== null && point.co !== undefined ? `<div>CO:</div><div style="font-weight: 500;">${point.co.toFixed(1)} ppm</div>` : ''}
              ${point.temperature !== null && point.temperature !== undefined ? `<div>Temp:</div><div style="font-weight: 500;">${point.temperature.toFixed(1)}°C</div>` : ''}
              ${point.humidity !== null && point.humidity !== undefined ? `<div>Humidity:</div><div style="font-weight: 500;">${point.humidity.toFixed(1)}%</div>` : ''}
              ${point.wind_speed !== null && point.wind_speed !== undefined ? `<div>Wind:</div><div style="font-weight: 500;">${point.wind_speed.toFixed(1)} m/s</div>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current?.addLayer(marker);
      });

      // Explicitly tell Leaflet to check its size after updates
      // Use requestAnimationFrame to ensure it runs after the current rendering cycle
      requestAnimationFrame(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          console.log("MapComponent: Map invalidated size");
        }
      });

      setError(null);
    } catch (err: any) {
      setError("Failed to update map visualization");
      console.error('Error updating map visualization:', err);
    }

  }, [data]); // Re-run this effect when 'data' changes

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className={`w-full h-full min-h-[400px] rounded-lg shadow-sm ${className || ''}`}
        style={{
          aspectRatio: '16/9',
          maxHeight: 'calc(100vh - 200px)'
        }}
      />
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { fetchMapData, MapData } from '@/services/api/dashboardApi';

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  className?: string;
}

const MapComponent = ({ className }: MapComponentProps) => {
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
  const getMarkerColor = (intensity: number | null) => {
    if (intensity === null) return '#808080'; // Gray for no data
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

  // Fetch and update map data
  useEffect(() => {
    const updateMapData = async () => {
      try {
        const mapData = await fetchMapData();
        
        // Update heatmap
        if (heatLayerRef.current) {
          const heatmapData = mapData.map(point => [point.latitude, point.longitude, point.intensity || 0]);
          heatLayerRef.current.setLatLngs(heatmapData);
        }

        // Update markers
        if (markersRef.current) {
          markersRef.current.clearLayers();
          
          mapData.forEach((point: MapData) => {
            const color = getMarkerColor(point.intensity);
            const marker = L.marker([point.latitude, point.longitude], {
              icon: createMarkerIcon(color)
            });

            // Create popup content
            const popupContent = `
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0;">${point.city}, ${point.region}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                  ${point.pm25 !== null ? `<div>PM2.5:</div><div>${point.pm25.toFixed(1)} µg/m³</div>` : ''}
                  ${point.pm10 !== null ? `<div>PM10:</div><div>${point.pm10.toFixed(1)} µg/m³</div>` : ''}
                  ${point.o3 !== null ? `<div>O3:</div><div>${point.o3.toFixed(1)} ppb</div>` : ''}
                  ${point.no2 !== null ? `<div>NO2:</div><div>${point.no2.toFixed(1)} ppb</div>` : ''}
                  ${point.so2 !== null ? `<div>SO2:</div><div>${point.so2.toFixed(1)} ppb</div>` : ''}
                  ${point.co !== null ? `<div>CO:</div><div>${point.co.toFixed(1)} ppm</div>` : ''}
                  ${point.temperature !== null ? `<div>Temp:</div><div>${point.temperature.toFixed(1)}°C</div>` : ''}
                  ${point.humidity !== null ? `<div>Humidity:</div><div>${point.humidity.toFixed(1)}%</div>` : ''}
                  ${point.wind_speed !== null ? `<div>Wind:</div><div>${point.wind_speed.toFixed(1)} m/s</div>` : ''}
                </div>
              </div>
            `;

            marker.bindPopup(popupContent);
            markersRef.current?.addLayer(marker);
          });
        }

        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error('Error updating map data:', err);
      }
    };

    // Initial fetch
    updateMapData();

    // Set up interval for periodic updates (every 5 minutes)
    const interval = setInterval(updateMapData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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
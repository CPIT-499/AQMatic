'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface MapComponentProps {
  className?: string;
}

const MapComponent = ({ className }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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
      zoomControl: false, // We'll add it in a different position
      scrollWheelZoom: true,
      fadeAnimation: true,
      maxBounds: saudiBounds,        // Restrict panning to these bounds
      maxBoundsViscosity: 1.0,       // Make the bounds completely solid
      minZoom: 5,                    // Restrict zoom out level
      maxZoom: 19
    });
    
    mapInstanceRef.current = map;

    // Ensure the map stays within bounds when zooming
    map.fitBounds(saudiBounds);

    // Add zoom control to top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Add a modern-looking tile layer (you can choose different styles)
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©StadiaMaps',
      maxZoom: 20,
      minZoom: 5
    }).addTo(map);
    
    

    // Enhanced heatmap configuration
    const heatmapData = [
      [24.7136, 46.6753, 0.8], // Riyadh
      [21.5433, 39.1728, 0.7], // Jeddah
      [21.3891, 39.8579, 0.7], // Mecca
      [24.5247, 39.5692, 0.6], // Medina
      [26.4207, 50.0888, 0.5], // Dammam
      [21.4267, 40.4833, 0.9]  // Taif
    ];

    // @ts-ignore - leaflet.heat type definitions
    L.heatLayer(heatmapData, {
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

    // Add a scale control
    L.control.scale({
      imperial: false,
      position: 'bottomright'
    }).addTo(map);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full min-h-[400px] rounded-lg shadow-sm ${className || ''}`}
      style={{
        aspectRatio: '16/9',
        maxHeight: 'calc(100vh - 200px)'
      }}
    />
  );
};

export default MapComponent;
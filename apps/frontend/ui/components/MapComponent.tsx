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

    // Initialize the map
    const map = L.map(mapRef.current).setView([21.5433, 39.1728], 12);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Sample data for heatmap - Jeddah districts air quality data
    const heatmapData = [
      [21.5433, 39.1728, 0.7], // Jeddah City Center
      [21.4858, 39.1925, 0.4], // Al Balad
      [21.6325, 39.1104, 0.9], // Obhur
      [21.5169, 39.2192, 0.6], // Al Safa
      [21.4225, 39.2492, 0.8], // Al Hamdaniyah
      [21.5656, 39.1250, 0.5], // Al Shati
      [21.4989, 39.1691, 0.3], // Al Andalus
      [21.5850, 39.1562, 0.7], // Al Zahra
      [21.4806, 39.2439, 0.6], // Al Faisaliyah
      [21.5478, 39.2121, 0.8]  // Al Rawdah
    ];

    // Add heatmap layer
    // @ts-ignore - leaflet.heat type definitions
    L.heatLayer(heatmapData, {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      max: 1.0,
      minOpacity: 0.4,
      gradient: {
        0.4: '#3388ff', // Good air quality
        0.6: '#98c13d', // Moderate air quality
        0.8: '#f9a825', // Poor air quality
        1.0: '#d32f2f'  // Very poor air quality
      }
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
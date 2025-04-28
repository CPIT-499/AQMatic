/**
 * Dashboard API Service
 * Handles all API interactions for the dashboard
 */

import axios from 'axios';
import { getSession } from 'next-auth/react';
import { api } from '@/services/api';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Extend the Session User type
interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  organizationId?: number;
  access_token?: string; // Match the property name from backend
}

// Add fallback map data
const FALLBACK_MAP_DATA: MapData[] = [
  {
    location_id: 1,
    latitude: 24.7136, 
    longitude: 46.6753,
    city: "Riyadh",
    region: "Riyadh Region",
    country: "Saudi Arabia",
    pm25: 28.3,
    pm10: 65.7,
    o3: 41.2,
    no2: 19.6,
    so2: 9.3,
    co: 1.4,
    temperature: 29.5,
    humidity: 45.0,
    wind_speed: 8.2,
    intensity: 0.4
  },
  {
    location_id: 2,
    latitude: 21.4858, 
    longitude: 39.1925,
    city: "Jeddah",
    region: "Makkah Region",
    country: "Saudi Arabia",
    pm25: 22.1,
    pm10: 52.3,
    o3: 38.7,
    no2: 16.4,
    so2: 7.5,
    co: 1.2,
    temperature: 32.1,
    humidity: 65.0,
    wind_speed: 9.5,
    intensity: 0.35
  },
  {
    location_id: 3,
    latitude: 26.3927, 
    longitude: 50.1152,
    city: "Dammam",
    region: "Eastern Province",
    country: "Saudi Arabia",
    pm25: 24.5,
    pm10: 58.9,
    o3: 39.5,
    no2: 18.2,
    so2: 8.1,
    co: 1.3,
    temperature: 30.7,
    humidity: 58.0,
    wind_speed: 12.3,
    intensity: 0.38
  },
  {
    location_id: 4,
    latitude: 24.4539, 
    longitude: 39.6142,
    city: "Medina",
    region: "Medina Region",
    country: "Saudi Arabia",
    pm25: 18.3,
    pm10: 42.1,
    o3: 35.2,
    no2: 14.1,
    so2: 6.2,
    co: 0.9,
    temperature: 28.3,
    humidity: 52.0,
    wind_speed: 7.8,
    intensity: 0.3
  },
  {
    location_id: 5,
    latitude: 25.3176, 
    longitude: 49.5817,
    city: "Al-Khobar",
    region: "Eastern Province",
    country: "Saudi Arabia",
    pm25: 22.8,
    pm10: 54.6,
    o3: 37.9,
    no2: 17.3,
    so2: 7.8,
    co: 1.25,
    temperature: 29.8,
    humidity: 62.0,
    wind_speed: 10.5,
    intensity: 0.36
  }
];

/**
 * Transforms raw API data into chart-friendly format
 */
export function transformApiData(rawData: any[]) {
  return rawData.map(item => ({
    date: item.date,
    pm25: item['pm2.5'] || null,
    pm10: item.pm10 || null,
    co: item.co || null,
    no2: item.no2 || null,
    o3: item.o3 || null,
    so2: item.so2 || null,
    humidity: item.humidity || null,
    temperature: item.temperature || null,
    wind_speed: item.wind_speed || null,
    co2: item.co2 || null,
    methane: item.methane || null,
    nitrous_oxide: item.nitrous_oxide || null,
    fluorinated_gases: item.fluorinated_gases || null
  }));
}

/**
 * Transforms raw map data into heatmap-friendly format
 */
export function transformMapData(rawData: any[]) {
  return rawData.map(item => [
    item.latitude,
    item.longitude,
    // Use intensity if available, otherwise calculate from PM2.5
    item.intensity !== null ? item.intensity : 
    // Normalize PM2.5 value between 0 and 1 for heatmap intensity
    // Assuming PM2.5 scale: 0-500 (0 is best, 500 is worst)
    Math.min((item.pm25 || 0) / 500, 1)
  ]);
}

/**
 * Get the auth token from the session - Replaced with centralized auth in api.ts
 */
async function getAuthHeader(): Promise<Record<string, string>> {
  // For backward compatibility - will be removed in future
  const session = await getSession();
  if (session?.user && (session.user as AuthUser).access_token) {
    return {
      Authorization: `Bearer ${(session.user as AuthUser).access_token}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
}

/**
 * Fetches hourly measurement data for charts
 */
export async function fetchHourlyMeasurementData() {
  try {
    // Use the centralized API client instead of direct fetch
    const rawData = await api.get<any[]>('/hourly_measurement_summary_View_graph');
    
    console.log('Raw data:', rawData); // Debugging line to check the raw data
    return transformApiData(rawData);
  } catch (error: any) {
    console.error('Error fetching hourly measurement data:', error);
    throw error; // Re-throw the error for the component to handle
  }
}

export interface MapData {
  location_id: number;
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  intensity: number | null;
}

/**
 * Fetches air quality map data
 */
export const fetchMapData = async (): Promise<MapData[]> => {
  try {
    // Use the centralized API client instead of axios with its own headers
    try {
      const data = await api.get<MapData[]>('/map_data');
      return data;
    } catch (corsError) {
      console.error('CORS or API error when fetching map data:', corsError);
      
      // Try a direct fetch with simpler CORS settings as a fallback
      try {
        const response = await fetch(`${API_BASE_URL}/map_data`, {
          method: 'GET',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'omit' // Try without credentials
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (directFetchError) {
        console.error('Direct fetch also failed:', directFetchError);
      }
      
      // If all fails, use fallback data
      console.warn('Using fallback map data due to API errors');
      return FALLBACK_MAP_DATA;
    }
  } catch (error) {
    console.error('Error fetching map data:', error);
    // Return fallback data instead of throwing an error
    return FALLBACK_MAP_DATA;
  }
};

/**
 * Fetches summary statistics from the protected endpoint
 */
export async function fetchSummaryStats() {
  try {
    // Use the centralized API client instead of direct fetch
    const data = await api.get('/protected/summary_stats');
    return data;
  } catch (error: any) {
    console.error('Error fetching summary stats:', error);
    // Return default values in case of error
    return {
      current_aqi: 0,
      pm25_level: 0,
      aqi_trend_pct: 0,
      pm25_trend_pct: 0,
      monitoring_stations: 0,
      alerts_today: 0
    };
  }
}

/**
 * Fetches all dashboard data (could be expanded for other endpoints)
 */
export async function fetchDashboardData() {
  try {
    const [chartData, mapData, summaryStats] = await Promise.all([
      fetchHourlyMeasurementData(),
      fetchMapData(),
      fetchSummaryStats()
    ]);
    
    return {
      chartData,
      mapData,
      summaryStats,
      error: null
    };
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return {
      chartData: [],
      mapData: [],
      summaryStats: {
        current_aqi: 0,
        pm25_level: 0,
        aqi_trend_pct: 0,
        pm25_trend_pct: 0,
        monitoring_stations: 0,
        alerts_today: 0
      },
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
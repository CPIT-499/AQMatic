import { getAPI } from '@/services/api/get';
import type { MapData } from './transform';

// Mock data for map when API fails
const MOCK_MAP_DATA: MapData[] = [
  { 
    location_id: 1, 
    latitude: 21.5169, 
    longitude: 39.2192, 
    city: "Jeddah", 
    region: "Makkah", 
    country: "Saudi Arabia", 
    pm25: 28, 
    pm10: 40, 
    o3: 35, 
    no2: 20, 
    so2: 15, 
    co: 0.8, 
    temperature: 32, 
    humidity: 65, 
    wind_speed: 12, 
    intensity: 0.4 
  },
  { 
    location_id: 2, 
    latitude: 24.7136, 
    longitude: 46.6753, 
    city: "Riyadh", 
    region: "Riyadh", 
    country: "Saudi Arabia", 
    pm25: 35, 
    pm10: 45, 
    o3: 42, 
    no2: 25, 
    so2: 18, 
    co: 1.2, 
    temperature: 36, 
    humidity: 45, 
    wind_speed: 8, 
    intensity: 0.6 
  },
  { 
    location_id: 3, 
    latitude: 26.4207, 
    longitude: 50.0888, 
    city: "Dammam", 
    region: "Eastern", 
    country: "Saudi Arabia", 
    pm25: 22, 
    pm10: 32, 
    o3: 30, 
    no2: 15, 
    so2: 12, 
    co: 0.6, 
    temperature: 34, 
    humidity: 70, 
    wind_speed: 15, 
    intensity: 0.3 
  }
];

/**
 * Fetches air quality map data.
 * Includes auth token if fetching organization data.
 */
export async function fetchMapData(mode: 'public' | 'organization', token: string | null): Promise<MapData[]> {
  try {
    const endpoint = '/map_data'; // Base endpoint
    const headers: { [key: string]: string } = {};

    if (mode === 'organization' && token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log("fetchMapData: Using token for organization data.");
    } else {
      console.log("fetchMapData: Fetching public data.");
    }

    // Pass headers to the updated getAPI function
    return await getAPI<MapData[]>(endpoint, { headers });

  } catch (error) {
    console.warn(`Error fetching ${mode} map data, using mock data:`, error);
    // Return mock data as a fallback if the API fails
    return MOCK_MAP_DATA;
  }
}
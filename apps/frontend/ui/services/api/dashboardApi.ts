/**
 * Dashboard API Service
 * Handles all API interactions for the dashboard
 */

import axios from 'axios';

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
 * Fetches hourly measurement data for charts
 */
export async function fetchHourlyMeasurementData() {
  try {
    const response = await fetch('http://localhost:8000/hourly_measurement_summary_View_graph');
  
    if (!response.ok) {
      throw new Error(`Chart data error: ${response.status}`);
    }
    
    const rawData = await response.json();
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
    const response = await axios.get<MapData[]>('http://localhost:8000/map_data');
    return response.data;
  } catch (error) {
    console.error('Error fetching map data:', error);
    throw error;
  }
};

/**
 * Fetches all dashboard data (could be expanded for other endpoints)
 */
export async function fetchDashboardData() {
  try {
    const [chartData, mapData] = await Promise.all([
      fetchHourlyMeasurementData(),
      fetchMapData()
    ]);
    
    return {
      chartData,
      mapData,
      error: null
    };
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return {
      chartData: [],
      mapData: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
export interface ChartData {
  date: string;
  pm25: number | null;
  pm10: number | null;
  co: number | null;
  no2: number | null;
  o3: number | null;
  so2: number | null;
  humidity: number | null;
  temperature: number | null;
  wind_speed: number | null;
  co2: number | null;
  methane: number | null;
  nitrous_oxide: number | null;
  fluorinated_gases: number | null;
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
 * Transforms raw measurement data into chart-friendly format
 */
export function transformApiData(rawData: any[]): ChartData[] {
  if (!rawData || !Array.isArray(rawData)) {
    console.warn("Received invalid data format:", rawData);
    return []; // Return empty array if data is invalid
  }
  
  return rawData.map(item => ({
    date: item.date,
    // Ensure property names match exactly what the chart component expects
    pm25: item['pm2.5'] || item.pm25 || null, // Handle both formats
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
 * Transforms raw map data into heatmap coordinates
 */
export function transformMapData(rawData: MapData[]): [number, number, number][] {
  return rawData.map(item => [
    item.latitude,
    item.longitude,
    item.intensity !== null
      ? item.intensity
      : Math.min((item.pm25 || 0) / 500, 1)
  ]);
}
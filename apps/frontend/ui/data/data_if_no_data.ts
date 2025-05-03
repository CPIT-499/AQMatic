// data/dashboardData.ts

// --- Types ---
export type TimeRangeOption = "7d" | "30d" | "90d";

export type GasKey = 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co' | 'temperature' | 'humidity' | 'co2' | 'wind_speed' | 'methane' | 'nitrous_oxide' | 'fluorinated_gases';

export interface ChartDataPoint {
  date: string;
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
  no2: number | null;
  so2: number | null;
  co?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  co2?: number | null;
  wind_speed?: number | null;
  methane?: number | null;
  nitrous_oxide?: number | null;
  fluorinated_gases?: number | null;
}

export interface GasConfig {
  [key: string]: {
    name: string;
    label: string;
    color: string;
    unit: string;
  };
}

export interface SummaryStat {
  title: string;
  value: number | string;
  status: {
    label: string;
    color: {
      bg: string;
      text: string;
      border: string;
    };
  };
  trend: {
    value: string;
    label: string;
  };
}

export interface Alert {
  id: string;
  severity: "destructive" | "warning" | "outline" | string; // Allow string for custom severity if needed
  title: string;
  description: string;
  timestamp: string;
  color?: string; // Optional color override
}

// --- Constants ---

export const GAS_CONFIG: GasConfig = {
  pm25: { name: 'PM2.5', label: "PM2.5", color: "#ef4444", unit: 'µg/m³' },
  pm10: { name: 'PM10', label: "PM10", color: "#f59e0b", unit: 'µg/m³' },
  o3: { name: 'O₃', label: "O₃", color: "#3b82f6", unit: 'ppb' },
  no2: { name: 'NO₂', label: "NO₂", color: "#10b981", unit: 'ppb' },
  so2: { name: 'SO₂', label: "SO₂", color: "#8b5cf6", unit: 'ppb' },
  co: { name: 'CO', label: 'CO', color: '#ec4899', unit: 'ppm' },
  temperature: { name: 'Temperature', label: 'Temperature', color: '#dc2626', unit: '°C' },
  humidity: { name: 'Humidity', label: 'Humidity', color: '#2563eb', unit: '%' },
  co2: { name: 'CO₂', label: 'CO₂', color: '#4b5563', unit: 'ppm' },
  wind_speed: { name: 'Wind Speed', label: 'Wind Speed', color: '#6366f1', unit: 'm/s' },
  methane: { name: 'Methane', label: 'Methane', color: '#d97706', unit: 'ppb' },
  nitrous_oxide: { name: 'Nitrous Oxide', label: 'Nitrous Oxide', color: '#9333ea', unit: 'ppb' },
  fluorinated_gases: { name: 'Fluorinated Gases', label: 'Fluorinated Gases', color: '#059669', unit: 'ppt' }
};

export const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "Last week" },
  { value: "30d", label: "Last month" },
  { value: "90d", label: "Last 3 months" }
] as const; // Use 'as const' for stricter typing

// --- API Helper Functions ---
// Function to generate status color and label based on AQI value
export function getAQIStatus(aqi: number) {
  if (aqi <= 50) {
    return { 
      label: "Good", 
      color: { 
        bg: "bg-green-100", 
        text: "text-green-800", 
        border: "border-green-200" 
      } 
    };
  } else if (aqi <= 100) {
    return { 
      label: "Moderate", 
      color: { 
        bg: "bg-yellow-100", 
        text: "text-yellow-800", 
        border: "border-yellow-200" 
      } 
    };
  } else if (aqi <= 150) {
    return { 
      label: "Unhealthy for Sensitive Groups", 
      color: { 
        bg: "bg-orange-100", 
        text: "text-orange-800", 
        border: "border-orange-200" 
      } 
    };
  } else if (aqi <= 200) {
    return { 
      label: "Unhealthy", 
      color: { 
        bg: "bg-red-100", 
        text: "text-red-800", 
        border: "border-red-200" 
      } 
    };
  } else if (aqi <= 300) {
    return { 
      label: "Very Unhealthy", 
      color: { 
        bg: "bg-purple-100", 
        text: "text-purple-800", 
        border: "border-purple-200" 
      } 
    };
  } else {
    return { 
      label: "Hazardous", 
      color: { 
        bg: "bg-gray-800", 
        text: "text-white", 
        border: "border-gray-700" 
      } 
    };
  }
}

// Function to create a percent trend string from a number
export function formatTrendPercent(value: number) {
  return value >= 0 ? `+${value}%` : `${value}%`;
}

// --- Fallback Data ---
// This data is only used if the API calls fail or during development
export const CHART_DATA: ChartDataPoint[] = [
  { date: "Apr 2", pm25: 999, pm10: 60, o3: 35, no2: 15, so2: 8, co: 1.2, temperature: 25, humidity: 60, co2: 10, wind_speed: 5, methane: 1.8, nitrous_oxide: 0.3, fluorinated_gases: 0.01 },
  { date: "Apr 4", pm25: 999, pm10: 70, o3: 38, no2: 18, so2: 10, co: 1.3, temperature: 26, humidity: 62, co2: 10, wind_speed: 6, methane: 1.9, nitrous_oxide: 0.32, fluorinated_gases: 0.011 },
  { date: "Apr 10", pm25: 999, pm10: 75, o3: 42, no2: 20, so2: 12, co: 1.4, temperature: 27, humidity: 64, co2: 20, wind_speed: 7, methane: 2.0, nitrous_oxide: 0.34, fluorinated_gases: 0.012 },
  { date: "Apr 20", pm25: 999, pm10: 85, o3: 45, no2: 22, so2: 14, co: 1.5, temperature: 28, humidity: 66, co2: 30, wind_speed: 8, methane: 2.1, nitrous_oxide: 0.36, fluorinated_gases: 0.013 },
  { date: "Apr 30", pm25: 999, pm10: 90, o3: 48, no2: 25, so2: 15, co: 1.6, temperature: 29, humidity: 68, co2: 40, wind_speed: 9, methane: 2.2, nitrous_oxide: 0.38, fluorinated_gases: 0.014 },
  { date: "May 5", pm25: 999, pm10: 95, o3: 50, no2: 28, so2: 16, co: 1.7, temperature: 30, humidity: 70, co2: 50, wind_speed: 10, methane: 2.3, nitrous_oxide: 0.4, fluorinated_gases: 0.015 },
  { date: "May 15", pm25: 999, pm10: 105, o3: 52, no2: 30, so2: 18, co: 1.8, temperature: 31, humidity: 72, co2: 60, wind_speed: 11, methane: 2.4, nitrous_oxide: 0.42, fluorinated_gases: 0.016 },
  { date: "May 25", pm25: 999, pm10: 120, o3: 55, no2: 32, so2: 20, co: 1.9, temperature: 32, humidity: 74, co2: 70, wind_speed: 12, methane: 2.5, nitrous_oxide: 0.44, fluorinated_gases: 0.017 },
  { date: "Jun 1", pm25: 999, pm10: 110, o3: 53, no2: 30, so2: 19, co: 1.85, temperature: 31.5, humidity: 73, co2: 65, wind_speed: 11.5, methane: 2.45, nitrous_oxide: 0.43, fluorinated_gases: 0.0165 },
  { date: "Jun 10", pm25: 36, pm10: 100, o3: 50, no2: 28, so2: 17, co: 1.8, temperature: 31, humidity: 72, co2: 60, wind_speed: 11, methane: 2.4, nitrous_oxide: 0.42, fluorinated_gases: 0.016 },
  { date: "Jun 20", pm25: 34, pm10: 95, o3: 48, no2: 26, so2: 16, co: 1.75, temperature: 30.5, humidity: 71, co2: 55, wind_speed: 10.5, methane: 2.35, nitrous_oxide: 0.41, fluorinated_gases: 0.0155 },
  { date: "Jun 30", pm25: 32, pm10: 90, o3: 45, no2: 24, so2: 15, co: 1.7, temperature: 30, humidity: 70, co2: 50, wind_speed: 10, methane: 2.3, nitrous_oxide: 0.4, fluorinated_gases: 0.015 },
];

// AI forecast data - future predicted data
export const FORECAST_DATA: ChartDataPoint[] = [
  { date: "May 1", pm25: 999, pm10: 92, o3: 49, no2: 26, so2: 16, co: 1.65, temperature: 29.5, humidity: 69, co2: 45, wind_speed: 9.5, methane: 2.25, nitrous_oxide: 0.39, fluorinated_gases: 0.0145 },
  { date: "May 5", pm25: 36, pm10: 98, o3: 51, no2: 29, so2: 17, co: 1.75, temperature: 31, humidity: 71, co2: 52, wind_speed: 10.5, methane: 2.35, nitrous_oxide: 0.41, fluorinated_gases: 0.0155 },
  { date: "May 10", pm25: 38, pm10: 105, o3: 53, no2: 31, so2: 18, co: 1.85, temperature: 32, humidity: 73, co2: 58, wind_speed: 11, methane: 2.42, nitrous_oxide: 0.43, fluorinated_gases: 0.0162 },
  { date: "May 15", pm25: 40, pm10: 112, o3: 54, no2: 32, so2: 19, co: 1.90, temperature: 32.5, humidity: 74, co2: 62, wind_speed: 11.5, methane: 2.47, nitrous_oxide: 0.44, fluorinated_gases: 0.0168 },
  { date: "May 20", pm25: 43, pm10: 122, o3: 56, no2: 33, so2: 21, co: 1.95, temperature: 33, humidity: 75, co2: 72, wind_speed: 12.5, methane: 2.55, nitrous_oxide: 0.45, fluorinated_gases: 0.0175 },
  { date: "May 25", pm25: 44, pm10: 125, o3: 57, no2: 34, so2: 22, co: 2.0, temperature: 33.5, humidity: 76, co2: 75, wind_speed: 13, methane: 2.6, nitrous_oxide: 0.46, fluorinated_gases: 0.018 },
  { date: "Jun 1", pm25: 41, pm10: 115, o3: 54, no2: 31, so2: 20, co: 1.9, temperature: 32, humidity: 74, co2: 67, wind_speed: 12, methane: 2.5, nitrous_oxide: 0.44, fluorinated_gases: 0.017 },
  { date: "Jun 5", pm25: 39, pm10: 108, o3: 52, no2: 30, so2: 19, co: 1.85, temperature: 31.5, humidity: 73, co2: 63, wind_speed: 11.5, methane: 2.45, nitrous_oxide: 0.43, fluorinated_gases: 0.0165 },
  { date: "Jun 10", pm25: 37, pm10: 102, o3: 51, no2: 29, so2: 18, co: 1.82, temperature: 31.2, humidity: 72, co2: 61, wind_speed: 11.2, methane: 2.42, nitrous_oxide: 0.425, fluorinated_gases: 0.0162 },
  { date: "Jun 15", pm25: 35, pm10: 97, o3: 49, no2: 27, so2: 17, co: 1.78, temperature: 30.8, humidity: 71, co2: 57, wind_speed: 10.8, methane: 2.38, nitrous_oxide: 0.415, fluorinated_gases: 0.0158 },
  { date: "Jun 20", pm25: 33, pm10: 93, o3: 47, no2: 25, so2: 16, co: 1.72, temperature: 30.3, humidity: 70, co2: 52, wind_speed: 10.3, methane: 2.32, nitrous_oxide: 0.405, fluorinated_gases: 0.0152 },
  { date: "Jun 25", pm25: 31, pm10: 88, o3: 44, no2: 23, so2: 14, co: 1.68, temperature: 29.8, humidity: 69, co2: 48, wind_speed: 9.8, methane: 2.28, nitrous_oxide: 0.395, fluorinated_gases: 0.0148 },
  { date: "Jun 30", pm25: 30, pm10: 85, o3: 43, no2: 22, so2: 13, co: 1.65, temperature: 29.5, humidity: 68, co2: 45, wind_speed: 9.5, methane: 2.25, nitrous_oxide: 0.39, fluorinated_gases: 0.0145 },
];

export const FALLBACK_SUMMARY_STATS: SummaryStat[] = [
    {
      title: "Current AQI",
      value: 0,
      status: { label: "Moderate", color: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" } },
      trend: { value: "+5%", label: "from yesterday" }
    },
    {
      title: "PM2.5 Level",
      value: 24.3,
      status: { label: "Unhealthy", color: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" } },
      trend: { value: "-2%", label: "from yesterday" }
    },
    {
      title: "Monitoring Stations",
      value: 6,
      status: { label: "All Online", color: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" } },
      trend: { value: "100%", label: "uptime" }
    },
    {
      title: "Alerts Today",
      value: 3,
      status: { label: "Attention Needed", color: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" } },
      trend: { value: "", label: "View details" }
    }
];

export const FALLBACK_ALERTS: Alert[] = [
  { id: "1", severity: "destructive", title: "High PM2.5 levels detected in Riyadh", description: "Levels exceeded 35μg/m³ for over 2 hours", timestamp: "2 hours ago" },
  { id: "2", severity: "warning", title: "Ozone levels rising in Jeddah", description: "Approaching unhealthy levels for sensitive groups", timestamp: "5 hours ago", color: "bg-yellow-500" },
  { id: "3", severity: "outline", title: "New monitoring station online", description: "Station #7 is now operational in Dammam", timestamp: "1 day ago", color: "bg-green-500" }
];
// data/dashboardData.ts

// --- Types ---
export type TimeRangeOption = "7d" | "30d" | "90d";

export type GasKey = 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co' | 'temperature' | 'humidity' | 'co2' | 'wind_speed' | 'methane' | 'nitrous_oxide' | 'fluorinated_gases';

export interface ChartDataPoint {
  date: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co?: number;
  temperature?: number;
  humidity?: number;
  co2?: number;
  wind_speed?: number;
  methane?: number;
  nitrous_oxide?: number;
  fluorinated_gases?: number;
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

// --- Sample Data ---

export const CHART_DATA: ChartDataPoint[] = [
  { date: "Apr 2", pm25: 22, pm10: 60, o3: 35, no2: 15, so2: 8, co: 1.2, temperature: 25, humidity: 60, co2: 10, wind_speed: 5, methane: 1.8, nitrous_oxide: 0.3, fluorinated_gases: 0.01 },
  { date: "Apr 4", pm25: 25, pm10: 70, o3: 38, no2: 18, so2: 10, co: 1.3, temperature: 26, humidity: 62, co2: 10, wind_speed: 6, methane: 1.9, nitrous_oxide: 0.32, fluorinated_gases: 0.011 },
  { date: "Apr 10", pm25: 28, pm10: 75, o3: 42, no2: 20, so2: 12, co: 1.4, temperature: 27, humidity: 64, co2: 20, wind_speed: 7, methane: 2.0, nitrous_oxide: 0.34, fluorinated_gases: 0.012 },
  { date: "Apr 20", pm25: 30, pm10: 85, o3: 45, no2: 22, so2: 14, co: 1.5, temperature: 28, humidity: 66, co2: 30, wind_speed: 8, methane: 2.1, nitrous_oxide: 0.36, fluorinated_gases: 0.013 },
  { date: "Apr 30", pm25: 32, pm10: 90, o3: 48, no2: 25, so2: 15, co: 1.6, temperature: 29, humidity: 68, co2: 40, wind_speed: 9, methane: 2.2, nitrous_oxide: 0.38, fluorinated_gases: 0.014 },
  { date: "May 5", pm25: 35, pm10: 95, o3: 50, no2: 28, so2: 16, co: 1.7, temperature: 30, humidity: 70, co2: 50, wind_speed: 10, methane: 2.3, nitrous_oxide: 0.4, fluorinated_gases: 0.015 },
  { date: "May 15", pm25: 38, pm10: 105, o3: 52, no2: 30, so2: 18, co: 1.8, temperature: 31, humidity: 72, co2: 60, wind_speed: 11, methane: 2.4, nitrous_oxide: 0.42, fluorinated_gases: 0.016 },
  { date: "May 25", pm25: 42, pm10: 120, o3: 55, no2: 32, so2: 20, co: 1.9, temperature: 32, humidity: 74, co2: 70, wind_speed: 12, methane: 2.5, nitrous_oxide: 0.44, fluorinated_gases: 0.017 },
  { date: "Jun 1", pm25: 40, pm10: 110, o3: 53, no2: 30, so2: 19, co: 1.85, temperature: 31.5, humidity: 73, co2: 65, wind_speed: 11.5, methane: 2.45, nitrous_oxide: 0.43, fluorinated_gases: 0.0165 },
  { date: "Jun 10", pm25: 36, pm10: 100, o3: 50, no2: 28, so2: 17, co: 1.8, temperature: 31, humidity: 72, co2: 60, wind_speed: 11, methane: 2.4, nitrous_oxide: 0.42, fluorinated_gases: 0.016 },
  { date: "Jun 20", pm25: 34, pm10: 95, o3: 48, no2: 26, so2: 16, co: 1.75, temperature: 30.5, humidity: 71, co2: 55, wind_speed: 10.5, methane: 2.35, nitrous_oxide: 0.41, fluorinated_gases: 0.0155 },
  { date: "Jun 30", pm25: 32, pm10: 90, o3: 45, no2: 24, so2: 15, co: 1.7, temperature: 30, humidity: 70, co2: 50, wind_speed: 10, methane: 2.3, nitrous_oxide: 0.4, fluorinated_gases: 0.015 },
];

export const SUMMARY_STATS: SummaryStat[] = [
    {
      title: "Current AQI",
      value: 87,
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

export const ALERTS: Alert[] = [
  { id: "1", severity: "destructive", title: "High PM2.5 levels detected in Riyadh", description: "Levels exceeded 35μg/m³ for over 2 hours", timestamp: "2 hours ago" },
  { id: "2", severity: "warning", title: "Ozone levels rising in Jeddah", description: "Approaching unhealthy levels for sensitive groups", timestamp: "5 hours ago", color: "bg-yellow-500" },
  { id: "3", severity: "outline", title: "New monitoring station online", description: "Station #7 is now operational in Dammam", timestamp: "1 day ago", color: "bg-green-500" }
];


// Placeholder Data for Organization Mode
export const CHART_DATA_ORG: ChartDataPoint[] = [
  { date: "Apr 2", pm25: 15, pm10: 40, o3: 25, no2: 10, so2: 5 },
  { date: "Apr 4", pm25: 18, pm10: 50, o3: 28, no2: 12, so2: 7 },
  { date: "Apr 10", pm25: 20, pm10: 55, o3: 30, no2: 15, so2: 8 },
  { date: "Apr 20", pm25: 22, pm10: 60, o3: 33, no2: 17, so2: 9 },
  { date: "Apr 30", pm25: 24, pm10: 65, o3: 35, no2: 20, so2: 10 },
  { date: "May 5", pm25: 26, pm10: 70, o3: 38, no2: 22, so2: 11 },
  { date: "May 15", pm25: 28, pm10: 75, o3: 40, no2: 24, so2: 12 },
  { date: "May 25", pm25: 30, pm10: 80, o3: 43, no2: 26, so2: 13 },
  { date: "Jun 1", pm25: 28, pm10: 70, o3: 41, no2: 24, so2: 12 },
  { date: "Jun 10", pm25: 26, pm10: 65, o3: 38, no2: 22, so2: 11 },
  { date: "Jun 20", pm25: 24, pm10: 60, o3: 35, no2: 20, so2: 10 },
  { date: "Jun 30", pm25: 22, pm10: 55, o3: 33, no2: 18, so2: 9 },
];

export const SUMMARY_STATS_ORG: SummaryStat[] = [
  {
    title: "Current AQI",
    value: 70,
    status: { label: "Good", color: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" } },
    trend: { value: "+2%", label: "from yesterday" }
  },
  {
    title: "PM2.5 Level",
    value: 15.5,
    status: { label: "Good", color: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" } },
    trend: { value: "-1%", label: "from yesterday" }
  },
  {
    title: "Monitoring Stations",
    value: 8,
    status: { label: "All Online", color: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" } },
    trend: { value: "100%", label: "uptime" }
  },
  {
    title: "Alerts Today",
    value: 0,
    status: { label: "No Alerts", color: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" } },
    trend: { value: "", label: "View details" }
  }
];

export const ALERTS_ORG: Alert[] = [
{ id: "1", severity: "outline", title: "Station maintenance complete", description: "Station #4 is back online", timestamp: "3 hours ago" }
];
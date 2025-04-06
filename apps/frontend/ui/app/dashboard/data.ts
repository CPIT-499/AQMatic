import { Alert } from "@/components/Alerts/AlertsSection";

export type TimeRangeOption = '24h' | '7d' | '30d' | '90d' | '1y';
export type GasKey = 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2';

// Sample chart data
export const chartData = [
  { date: "Apr 2", pm25: 22, pm10: 60, o3: 35, no2: 15, so2: 8 },
  { date: "Apr 4", pm25: 25, pm10: 70, o3: 38, no2: 18, so2: 10 },
  { date: "Apr 10", pm25: 28, pm10: 75, o3: 42, no2: 20, so2: 12 },
  { date: "Apr 20", pm25: 30, pm10: 85, o3: 45, no2: 22, so2: 14 },
  { date: "Apr 30", pm25: 32, pm10: 90, o3: 48, no2: 25, so2: 15 },
  { date: "May 5", pm25: 35, pm10: 95, o3: 50, no2: 28, so2: 16 },
  { date: "May 15", pm25: 38, pm10: 105, o3: 52, no2: 30, so2: 18 },
  { date: "May 25", pm25: 42, pm10: 120, o3: 55, no2: 32, so2: 20 },
  { date: "Jun 1", pm25: 40, pm10: 110, o3: 53, no2: 30, so2: 19 },
  { date: "Jun 10", pm25: 36, pm10: 100, o3: 50, no2: 28, so2: 17 },
  { date: "Jun 20", pm25: 34, pm10: 95, o3: 48, no2: 26, so2: 16 },
  { date: "Jun 30", pm25: 32, pm10: 90, o3: 45, no2: 24, so2: 15 },
];

export const timeRangeOptions: Record<TimeRangeOption, string> = {
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  '1y': 'Last Year'
};

export const gasConfig: Record<GasKey, { name: string; color: string; unit: string }> = {
  pm25: { name: 'PM2.5', color: '#ef4444', unit: 'µg/m³' },
  pm10: { name: 'PM10', color: '#f59e0b', unit: 'µg/m³' },
  o3: { name: 'O₃', color: '#3b82f6', unit: 'ppb' },
  no2: { name: 'NO₂', color: '#10b981', unit: 'ppb' },
  so2: { name: 'SO₂', color: '#8b5cf6', unit: 'ppb' }
};

// Static summary stats
export const SUMMARY_STATS = [
  {
    title: "Current AQI",
    value: 87,
    status: {
      label: "Moderate",
      color: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200"
      }
    },
    trend: {
      value: "+5%",
      label: "from yesterday"
    }
  },
  {
    title: "PM2.5 Level",
    value: 24.3,
    status: {
      label: "Unhealthy",
      color: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-200"
      }
    },
    trend: {
      value: "-2%",
      label: "from yesterday"
    }
  },
  {
    title: "Monitoring Stations",
    value: 6,
    status: {
      label: "All Online",
      color: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200"
      }
    },
    trend: {
      value: "100%",
      label: "uptime"
    }
  },
  {
    title: "Alerts Today",
    value: 3,
    status: {
      label: "Attention Needed",
      color: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200"
      }
    },
    trend: {
      value: "",
      label: "View details"
    }
  }
];

// Alert data
export const ALERTS: Alert[] = [
  {
    id: "1",
    severity: "destructive",
    title: "High PM2.5 levels detected in Riyadh",
    description: "Levels exceeded 35μg/m³ for over 2 hours",
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    severity: "warning",
    title: "Ozone levels rising in Jeddah",
    description: "Approaching unhealthy levels for sensitive groups",
    timestamp: "5 hours ago",
    color: "bg-yellow-500"
  },
  {
    id: "3",
    severity: "outline",
    title: "New monitoring station online",
    description: "Station #7 is now operational in Dammam",
    timestamp: "1 day ago",
    color: "bg-green-500"
  },
  {
    id: "4",
    severity: "outline",
    title: "Scheduled maintenance for station #3",
    description: "Maintenance will occur on April 15th from 2 AM to 4 AM",
    timestamp: "1 day ago",
    color: "bg-blue-500"
  },
  {
    id: "5",
    severity: "outline",
    title: "New air quality guidelines released",
    description: "Updated guidelines for PM2.5 and Ozone levels",
    timestamp: "2 days ago",
    color: "bg-blue-500"
  }
];

export interface RegionData {
  name: string;
  value: number;
  color: string;
}

export const regionData: RegionData[] = [
  { name: "Northern Region", value: 65, color: "bg-green-500" },
  { name: "Central Region", value: 82, color: "bg-blue-500" },
  { name: "Southern Region", value: 71, color: "bg-purple-500" }
];

export interface MetricData {
  year: string;
  [key: string]: string | number;
}

export const aqiData: MetricData[] = [
  { year: '2019', aqi: 89 },
  { year: '2020', aqi: 85 },
  { year: '2021', aqi: 83 },
  { year: '2022', aqi: 80 },
  { year: '2023', aqi: 76.5 }
];

export const pm25Data: MetricData[] = [
  { year: '2019', pm: 28.5 },
  { year: '2020', pm: 26.8 },
  { year: '2021', pm: 25.2 },
  { year: '2022', pm: 24.0 },
  { year: '2023', pm: 22.4 }
];

export const complianceData: MetricData[] = [
  { year: '2019', rate: 65 },
  { year: '2020', rate: 70 },
  { year: '2021', rate: 74 },
  { year: '2022', rate: 77 },
  { year: '2023', rate: 82 }
];

export const monthlyPollutantData = [
  { year: 'Jan', pm25: 35, pm10: 80, o3: 25, no2: 22, so2: 15 },
  { year: 'Feb', pm25: 38, pm10: 85, o3: 28, no2: 24, so2: 16 },
  { year: 'Mar', pm25: 32, pm10: 75, o3: 30, no2: 20, so2: 14 },
  { year: 'Apr', pm25: 28, pm10: 65, o3: 35, no2: 18, so2: 12 },
  { year: 'May', pm25: 25, pm10: 60, o3: 40, no2: 16, so2: 10 },
  { year: 'Jun', pm25: 23, pm10: 55, o3: 45, no2: 15, so2: 9 },
  { year: 'Jul', pm25: 20, pm10: 50, o3: 42, no2: 14, so2: 8 },
  { year: 'Aug', pm25: 18, pm10: 45, o3: 38, no2: 13, so2: 7 },
  { year: 'Sep', pm25: 22, pm10: 52, o3: 35, no2: 16, so2: 9 },
  { year: 'Oct', pm25: 26, pm10: 62, o3: 30, no2: 18, so2: 11 },
  { year: 'Nov', pm25: 30, pm10: 70, o3: 25, no2: 20, so2: 13 },
  { year: 'Dec', pm25: 32, pm10: 75, o3: 22, no2: 21, so2: 14 },
];

export interface Recommendation {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
}

export const recommendationsData: Recommendation[] = [
  {
    type: 'warning',
    title: 'Moderate Air Quality Expected',
    description: 'Based on seasonal patterns, we anticipate moderate air quality conditions over the next 30 days.'
  },
  {
    type: 'info',
    title: 'Monitoring Recommendations',
    description: 'Consider increasing monitoring frequency at high-traffic locations and industrial zones during peak hours.'
  },
  {
    type: 'success',
    title: 'Positive Trend',
    description: 'Overall, air quality is showing continuous improvement. Keep monitoring and enforcing current regulations.'
  }
]; 
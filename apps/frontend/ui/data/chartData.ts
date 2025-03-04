/**
 * Chart data interface
 * Defines the structure of each data point in the chart
 */
export interface ChartDataPoint {
    date: string;      // Date string in ISO format (YYYY-MM-DD)
    desktop: number;   // Primary reading value
    mobile: number;    // Secondary reading value
  }
  
  /**
   * Sample air quality monitoring data
   * Spans 90 days (April - June 2024)
   * Contains simulated readings for visualization purposes
   */
  export const chartData: ChartDataPoint[] = [
    // April 2024
    { date: "2024-04-01", desktop: 45, mobile: 38 },
    { date: "2024-04-02", desktop: 52, mobile: 42 },
    { date: "2024-04-03", desktop: 49, mobile: 40 },
    { date: "2024-04-04", desktop: 63, mobile: 51 },
    { date: "2024-04-05", desktop: 58, mobile: 47 },
    { date: "2024-04-10", desktop: 72, mobile: 61 },
    { date: "2024-04-15", desktop: 65, mobile: 55 },
    { date: "2024-04-20", desktop: 79, mobile: 67 },
    { date: "2024-04-25", desktop: 81, mobile: 70 },
    { date: "2024-04-30", desktop: 75, mobile: 64 },
    
    // May 2024
    { date: "2024-05-01", desktop: 68, mobile: 57 },
    { date: "2024-05-05", desktop: 73, mobile: 62 },
    { date: "2024-05-10", desktop: 86, mobile: 75 },
    { date: "2024-05-15", desktop: 92, mobile: 81 },
    { date: "2024-05-20", desktop: 88, mobile: 76 },
    { date: "2024-05-25", desktop: 95, mobile: 84 },
    { date: "2024-05-30", desktop: 101, mobile: 90 },
    
    // June 2024
    { date: "2024-06-01", desktop: 98, mobile: 87 },
    { date: "2024-06-05", desktop: 105, mobile: 92 },
    { date: "2024-06-10", desktop: 112, mobile: 99 },
    { date: "2024-06-15", desktop: 97, mobile: 85 },
    { date: "2024-06-20", desktop: 86, mobile: 76 },
    { date: "2024-06-25", desktop: 93, mobile: 82 },
    { date: "2024-06-30", desktop: 88, mobile: 78 }
  ]
  
  /**
   * Air Quality Index (AQI) reference values
   * Based on EPA standards
   */
  export const aqiReferenceValues = {
    good: { min: 0, max: 50, color: "bg-green-500" },
    moderate: { min: 51, max: 100, color: "bg-yellow-500" },
    unhealthySensitive: { min: 101, max: 150, color: "bg-orange-500" },
    unhealthy: { min: 151, max: 200, color: "bg-red-500" },
    veryUnhealthy: { min: 201, max: 300, color: "bg-purple-500" },
    hazardous: { min: 301, max: 500, color: "bg-red-900" }
  }
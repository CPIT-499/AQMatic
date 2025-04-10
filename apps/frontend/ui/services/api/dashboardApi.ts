/**
 * Dashboard API Service
 * Handles all API interactions for the dashboard
 */

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
  
  /**
   * Fetches all dashboard data (could be expanded for other endpoints)
   */
  export async function fetchDashboardData() {
    try {
      const chartData = await fetchHourlyMeasurementData();
      return {
        chartData,
        error: null
      };
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      return {
        chartData: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
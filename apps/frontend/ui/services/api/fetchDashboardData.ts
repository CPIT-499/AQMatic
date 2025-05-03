import { fetchHourlyMeasurementData } from './fetchHourlyMeasurementData';
import { fetchMapData } from './fetchMapData';
import { fetchSummaryStats } from './fetchSummaryStats';
import { fetchForecastSummaryData } from './fetchForecastSummaryData'; 

/**
 * Fetches all dashboard data (chart, map, summary, forecast)
 * Adjusts API calls based on mode and includes token for organization data.
 */
export async function fetchDashboardData(mode: 'public' | 'organization', token: string | null) {
  console.log(`fetchDashboardData called with mode: ${mode}, token present: ${!!token}`);
  try {
    // Fetch all data in parallel, 
    const [chartData, mapData, summaryStats, forecastData] = await Promise.all([
      fetchHourlyMeasurementData(mode, token),
      fetchMapData(mode, token),
      fetchSummaryStats(mode, token),
      fetchForecastSummaryData(mode, token) // Add this line
    ]);
    
    return { chartData, mapData, summaryStats, forecastData, error: null }; // Include forecastData in the return
  } catch (error: any) {
    console.error(`Error fetching ${mode} dashboard data:`, error);
    
    // when an error occurs
    return {
      chartData: [],
      mapData: [],
      summaryStats: {},
      forecastData: [], // Add this line with empty default
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
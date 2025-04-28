import { fetchHourlyMeasurementData } from './fetchHourlyMeasurementData';
import { fetchMapData } from './fetchMapData';
import { fetchSummaryStats } from './fetchSummaryStats';

/**
 * Fetches all dashboard data (chart, map, summary)
 * Each function already has its own error handling
 */
export async function fetchDashboardData() {
  try {
    // Fetch all data in parallel
    const [chartData, mapData, summaryStats] = await Promise.all([
      fetchHourlyMeasurementData(),
      fetchMapData(),
      fetchSummaryStats()
    ]);
    
    return { chartData, mapData, summaryStats, error: null };
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    
    // Propagate the error to be handled by the component
    return {
      chartData: [],
      mapData: [],
      summaryStats: {},
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
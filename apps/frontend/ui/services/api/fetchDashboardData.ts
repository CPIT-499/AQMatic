import { fetchHourlyMeasurementData } from './fetchHourlyMeasurementData';
import { fetchMapData } from './fetchMapData';
import { fetchSummaryStats } from './fetchSummaryStats';

/**
 * Fetches all dashboard data (chart, map, summary)
 * Adjusts API calls based on mode and includes token for organization data.
 */
export async function fetchDashboardData(mode: 'public' | 'organization', token: string | null) {
  console.log(`fetchDashboardData called with mode: ${mode}, token present: ${!!token}`);
  try {
    // Fetch all data in parallel, passing mode and token to each underlying fetcher
    // NOTE: Assumes the underlying functions are updated to accept (mode, token)
    const [chartData, mapData, summaryStats] = await Promise.all([
      fetchHourlyMeasurementData(mode, token),
      fetchMapData(mode, token),
      fetchSummaryStats(mode, token)
    ]);
    
    return { chartData, mapData, summaryStats, error: null };
  } catch (error: any) {
    console.error(`Error fetching ${mode} dashboard data:`, error);
    
    // Propagate the error to be handled by the component
    return {
      chartData: [],
      mapData: [],
      summaryStats: {},
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
import { getAPI } from '@/services/api/get';

export interface SummaryStats {
  current_aqi: number;
  pm25_level: number;
  aqi_trend_pct: number;
  pm25_trend_pct: number;
  monitoring_stations: number;
  alerts_today: number;
  hours_since_previous: number;
}

// Mock data to use when API call fails
const MOCK_SUMMARY_STATS: SummaryStats = {
  current_aqi: 75,
  pm25_level: 28,
  aqi_trend_pct: 5.2,
  pm25_trend_pct: -3.8,
  monitoring_stations: 12,
  alerts_today: 3,
  hours_since_previous: 24
};

/**
 * Fetches summary statistics.
 * Includes auth token if fetching organization data.
 */
export async function fetchSummaryStats(mode: 'public' | 'organization', token: string | null): Promise<SummaryStats> {
  try {
    const endpoint = '/summary_stats'; // Base endpoint
    const headers: { [key: string]: string } = {};

    if (mode === 'organization' && token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log("fetchSummaryStats: Using token for organization data.");
    } else {
      console.log("fetchSummaryStats: Fetching public data.");
    }

    // Pass headers to the updated getAPI function
    return await getAPI<SummaryStats>(endpoint, { headers });

  } catch (error) {
    console.warn(`Error fetching ${mode} summary stats, using mock data:`, error);
    // Return mock data as a fallback
    return MOCK_SUMMARY_STATS;
  }
}
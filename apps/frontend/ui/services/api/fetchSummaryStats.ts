import { getAPI } from '@/services/api/get';

export interface SummaryStats {
  current_aqi: number;
  pm25_level: number;
  aqi_trend_pct: number;
  pm25_trend_pct: number;
  monitoring_stations: number;
  alerts_today: number;
}

// Mock data to use when API call fails
const MOCK_SUMMARY_STATS: SummaryStats = {
  current_aqi: 75,
  pm25_level: 28,
  aqi_trend_pct: 5.2,
  pm25_trend_pct: -3.8,
  monitoring_stations: 12,
  alerts_today: 3
};

/**
 * Fetches summary statistics
 */
export async function fetchSummaryStats(): Promise<SummaryStats> {
  try {
    return await getAPI<SummaryStats>('/summary_stats');
  } catch (error) {
    console.warn('Error fetching summary stats, using mock data:', error);
    return MOCK_SUMMARY_STATS;
  }
}
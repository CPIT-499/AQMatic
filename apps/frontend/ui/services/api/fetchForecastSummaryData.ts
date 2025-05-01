import { getAPI } from '@/services/api/get';
import { transformApiData } from './transform';

/**
 * Fetches forecast summary data for charts.
 * Includes auth token if fetching organization data.
 */
export async function fetchForecastSummaryData(mode: 'public' | 'organization', token: string | null) {
  try {
    const endpoint = '/forecast_summary'; // Base endpoint
    const headers: { [key: string]: string } = {};

    // If organization mode and token exists, add Authorization header
    if (mode === 'organization' && token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log("fetchForecastSummaryData: Using token for organization data.");
    } else {
      console.log("fetchForecastSummaryData: Fetching public data.");
    }

    // Pass headers (and potentially params) to the API call
    const rawData = await getAPI<any[]>(endpoint, { headers });
    
    return transformApiData(rawData);
  } catch (error) {
    console.error(`Error fetching ${mode} forecast summary data:`, error);
    throw error;
  }
}
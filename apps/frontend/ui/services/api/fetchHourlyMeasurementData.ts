import { getAPI } from '@/services/api/get';
import { transformApiData } from './transform';

/**
 * Fetches hourly measurement data for charts.
 * Includes auth token if fetching organization data.
 */
export async function fetchHourlyMeasurementData(mode: 'public' | 'organization', token: string | null) {
  try {
    const endpoint = '/hourly_measurement_summary_View_graph'; // Base endpoint
    const headers: { [key: string]: string } = {};

    // If organization mode and token exists, add Authorization header
    if (mode === 'organization' && token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log("fetchHourlyMeasurementData: Using token for organization data.");
      // Optionally, modify endpoint or add query params if needed for org vs public
      // e.g., endpoint = '/organization/hourly_measurement_summary_View_graph';
      // Or add params: { params: { mode: 'organization' } }
    } else {
      console.log("fetchHourlyMeasurementData: Fetching public data.");
      // Optionally, ensure params indicate public mode if backend requires it
      // e.g., { params: { mode: 'public' } }
    }

    // Pass headers (and potentially params) to the API call
    const rawData = await getAPI<any[]>(endpoint, { headers });
    
    return transformApiData(rawData);
  } catch (error) {
    console.error(`Error fetching ${mode} hourly measurement data:`, error);
    throw error;
  }
}
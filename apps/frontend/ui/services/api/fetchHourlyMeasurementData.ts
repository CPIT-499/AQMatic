import { getAPI } from '@/services/api/get';
import { transformApiData } from './transform';

/**
 * Fetches hourly measurement data for charts
 */
export async function fetchHourlyMeasurementData() {
  try {
    const rawData = await getAPI<any[]>('/hourly_measurement_summary_View_graph');
    return transformApiData(rawData);
  } catch (error) {
    console.error('Error fetching hourly measurement data:', error);
    throw error;
  }
}
import { getAPI } from '@/services/api/get';
import { ChartDataPoint } from '@/data/data_if_no_data';

/**
 * Fetches air quality data and returns it for CSV export.
 * @param mode Public or organization mode
 * @param timeRange Time range for the data (e.g., '7d', '30d', '90d')
 * @param token Authentication token for organization data
 * @returns Array of data points for CSV export
 */
export async function fetchDataForExport(
  mode: 'public' | 'organization', 
  timeRange: string,
  token: string | null
): Promise<ChartDataPoint[]> {
  try {
    const endpoint = '/hourly_measurement_summary_View_graph'; // Use the same endpoint as chart data
    const headers: { [key: string]: string } = {};
    
    // Add token if in organization mode
    if (mode === 'organization' && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Fetch data from API
    const data = await getAPI<any[]>(endpoint, { headers });
    
    // Return the raw data for conversion to CSV in the component
    return data;
  } catch (error) {
    console.error(`Error fetching data for export (${mode}, ${timeRange}):`, error);
    throw error;
  }
}

/**
 * Converts chart data to CSV format
 * @param data Chart data points
 * @param selectedGases List of gases selected by the user
 * @returns CSV formatted string
 */
export function convertDataToCsv(data: ChartDataPoint[], selectedGases: string[]): string {
  if (!data || data.length === 0) {
    return 'No data available';
  }
  
  // Filter gases that have at least one data point with a value
  const gasesWithData = selectedGases.filter(gas => 
    data.some(point => 
      point[gas as keyof typeof point] !== undefined && 
      point[gas as keyof typeof point] !== null
    )
  );
    // Create headers with only gases that have data
  const headers = ['date', ...gasesWithData];
  
  // Create CSV rows
  const rows = data.map(point => {
    const row = [
      point.date,
      ...gasesWithData.map(gas => point[gas as keyof typeof point] ?? '')
    ];
    return row.join(',');
  });
  
  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
}

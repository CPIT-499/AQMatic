import { useState, useEffect, useMemo } from 'react';
import {
  CHART_DATA,
  GasKey,
  GAS_CONFIG,
  TimeRangeOption,
  ChartDataPoint
} from "@/data/dashboardData";
import { api } from "@/services/api";

// --- useDashboardData ---
interface DashboardDataState {
  chartData: ChartDataPoint[];
  loading: boolean;
  error: string | null;
}

export const useDashboardData = (organizationId?: number) => {
  const [dashboardData, setDashboardData] = useState<DashboardDataState>({
    chartData: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setDashboardData(prev => ({...prev, loading: true}));
        
        // Use the API service without manually adding organization_id
        // The API service will handle adding the correct organization ID
        let endpoint = '/hourly_measurement_summary_View_graph';
        
        // Only append organization_id if explicitly provided
        if (organizationId !== undefined) {
          console.log(`Fetching dashboard data for organization ID: ${organizationId}`);
          endpoint = `/hourly_measurement_summary_View_graph?organization_id=${organizationId}`;
        }
          
        const chartData = await api.get<ChartDataPoint[]>(endpoint);
        
        setDashboardData({
          chartData: chartData || [],
          loading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          chartData: CHART_DATA, // Fallback to static data on error
          error: error.message || 'Failed to fetch data'
        }));
      }
    }

    fetchData();
  }, [organizationId]);

  return dashboardData;
};

// --- useFilteredData ---
interface UseFilteredDataProps {
  timeRange: TimeRangeOption;
  dashboardData: {
    chartData: ChartDataPoint[];
    loading: boolean;
    error: null | string;
  };
}

export const useFilteredData = ({ timeRange, dashboardData }: UseFilteredDataProps) => {
  return useMemo(() => {
    const data = dashboardData.chartData.length > 0
      ? dashboardData.chartData
      : CHART_DATA; // Use fallback data if no API data available

    // Filter data based on time range
    // The API might return data already sorted by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const today = new Date();
    let filteredData: ChartDataPoint[] = [];
    
    switch (timeRange) {
      case "7d":
        // Last 7 days
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        filteredData = sortedData.filter(item => 
          new Date(item.date) >= sevenDaysAgo
        );
        break;
      case "30d":
        // Last 30 days
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        filteredData = sortedData.filter(item => 
          new Date(item.date) >= thirtyDaysAgo
        );
        break;
      case "90d":
      default:
        // Last 90 days (or all data if less than 90 days)
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        filteredData = sortedData.filter(item => 
          new Date(item.date) >= ninetyDaysAgo
        );
        break;
    }
    
    // If no data matches the filter, return a reasonable subset of all data
    return filteredData.length > 0 ? filteredData : sortedData.slice(-10);
  }, [timeRange, dashboardData.chartData]);
};

// --- useGasSelection ---
export function useGasSelection() {
  const [selectedGases, setSelectedGases] = useState<GasKey[]>(["pm25"]);

  const allGasKeys = Object.keys(GAS_CONFIG) as GasKey[];
  const allSelected = selectedGases.length === allGasKeys.length;

  const toggleGas = (gas: string) => {
    if (gas === "All") {
      setSelectedGases(
        selectedGases.length === allGasKeys.length ? ["pm25"] : allGasKeys
      );
    } else if (Object.keys(GAS_CONFIG).includes(gas)) {
      const gasKey = gas as GasKey;
      setSelectedGases((prev) => 
        prev.includes(gasKey) 
          ? prev.filter((g) => g !== gasKey)
          : [...prev, gasKey]
      );
    }
  };

  return {
    selectedGases,
    setSelectedGases,
    toggleGas,
    allSelected
  };
}
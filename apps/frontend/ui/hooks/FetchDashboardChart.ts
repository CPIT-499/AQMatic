import { useState, useEffect, useMemo } from 'react';
import { fetchDashboardData } from "@/services/api/dashboardApi";
import {
  CHART_DATA,
  CHART_DATA_ORG,
} from "@/data/dashboardData";
import { TimeRangeOption } from '@/data/dashboardData';

// Define GasKey type here
export type GasKey =
  | 'pm25'
  | 'pm10'
  | 'o3'
  | 'no2'
  | 'so2'
  | 'co'
  | 'temperature'
  | 'humidity'
  | 'co2'
  | 'wind_speed'
  | 'methane'
  | 'nitrous_oxide'
  | 'fluorinated_gases';

// Define gasConfig here (example)
export const gasConfig: { [key in GasKey]: { label: string; color: string } } = {
  pm25: { label: 'PM2.5', color: '#e45756' },
  pm10: { label: 'PM10', color: '#4c78a8' },
  o3: { label: 'Ozone', color: '#f58518' },
  no2: { label: 'Nitrogen Dioxide', color: '#e45756' },
  so2: { label: 'Sulfur Dioxide', color: '#72b7b2' },
  co: { label: 'Carbon Monoxide', color: '#54a24b' },
  temperature: { label: 'Temperature', color: '#64b5f6' },
  humidity: { label: 'Humidity', color: '#a1887f' },
  co2: { label: 'CO2', color: '#90a4ae' },
  wind_speed: { label: 'Wind Speed', color: '#ba68c8' },
  methane: { label: 'Methane', color: '#8bc34a' },
  nitrous_oxide: { label: 'Nitrous Oxide', color: '#fbc02d' },
  fluorinated_gases: { label: 'Fluorinated Gases', color: '#6d4c41' },
};

// --- useDashboardData ---
interface DashboardDataState {
  chartData: any[];
  loading: boolean;
  error: string | null;
}

export const useDashboardData = (selectedMode: "public" | "organization") => {
  const [dashboardData, setDashboardData] = useState<DashboardDataState>({
    chartData: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setDashboardData(prev => ({...prev, loading: true}));
        const { chartData, error } = await fetchDashboardData();
        setDashboardData({
          chartData: chartData || [],
          loading: false,
          error: error
        });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch data'
        }));
      }
    }

    fetchData();
  }, [selectedMode]);

  return dashboardData;
};

// --- useFilteredData ---
interface UseFilteredDataProps {
  timeRange: TimeRangeOption;
  selectedMode: "public" | "organization";
  dashboardData: {
    chartData: any[];
    loading: boolean;
    error: null | string;
  };
}

export const useFilteredData = ({ timeRange, selectedMode, dashboardData }: UseFilteredDataProps) => {
  return useMemo(() => {
    const data = dashboardData.chartData.length > 0
      ? dashboardData.chartData
      : (selectedMode === "public" ? CHART_DATA : CHART_DATA_ORG);

    switch (timeRange) {
      case "7d":
        return data.slice(-3);
      case "30d":
        return data.slice(-7);
      case "90d":
      default:
        return data;
    }
  }, [timeRange, selectedMode, dashboardData.chartData]);
};

// --- useGasSelection ---
export function useGasSelection() {
  const [selectedGases, setSelectedGases] = useState<GasKey[]>(["pm25"]);

  const allGasKeys = Object.keys(gasConfig) as GasKey[];
  const allSelected = selectedGases.length === allGasKeys.length;

  const toggleGas = (gas: string) => {
    if (gas === "All") {
      setSelectedGases(
        selectedGases.length === allGasKeys.length ? ["pm25"] : allGasKeys
      );
    } else if (Object.keys(gasConfig).includes(gas)) {
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
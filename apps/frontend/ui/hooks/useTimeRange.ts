import { useState, useMemo } from "react";
import { TimeRangeOption, chartData, timeRangeOptions } from "@/app/dashboard/data";

export function useTimeRange() {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("90d");

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === "7d") {
      return chartData.slice(-3); // Last 3 entries for demo
    } else if (timeRange === "30d") {
      return chartData.slice(-7); // Last 7 entries for demo
    }
    return chartData; // Full data for 90d
  }, [timeRange]);

  // Get label for current time range
  const timeRangeLabel = timeRangeOptions[timeRange];

  return {
    timeRange,
    setTimeRange,
    filteredData,
    timeRangeLabel
  };
} 
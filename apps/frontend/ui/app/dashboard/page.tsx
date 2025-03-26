"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

// Data and Types
import {
  CHART_DATA,
  CHART_DATA_ORG,
  GAS_CONFIG,
  SUMMARY_STATS,
  SUMMARY_STATS_ORG,
  ALERTS,
  ALERTS_ORG,
  TimeRangeOption
} from "@/data/dashboardData"; // Adjust path

// UI Components
import Navbar from "@/components/Navbar/navbar";
import { SummaryStats } from "@/components/Dashboard/SummaryStats";
import { AlertsSection } from "@/components/Alerts/AlertsSection";
import { ModeSelector } from "@/components/Dashboard/ModeSelector"; // New component
import { ChartSection } from "@/components/Dashboard/ChartSection"; // New component
import { MapSection } from "@/components/Dashboard/MapSection";     // New component
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "destructive" | "warning" | "outline";
  timestamp?: string; // Added optional timestamp
}
export default function DashboardPage() {
  const router = useRouter();

  // --- State ---
  const [selectedMode, setSelectedMode] = React.useState<"public" | "organization">("public");
  const [selectedGases, setSelectedGases] = React.useState<string[]>(["pm25"]); // Default selection
  const [timeRange, setTimeRange] = React.useState<TimeRangeOption>("90d");

  // --- Memoized Data Filtering ---
  const filteredData = React.useMemo(() => {
    const data = selectedMode === "public" ? CHART_DATA : CHART_DATA_ORG;
    
    switch (timeRange) {
      case "7d":
        return data.slice(-3); // Placeholder: last 3 entries
      case "30d":
        return data.slice(-7); // Placeholder: last 7 entries
      case "90d":
      default:
        return data; // Full data
    }
  }, [timeRange, selectedMode]);

  // --- Memoized Stats Filtering ---
  const filteredSummaryStats = React.useMemo(() => {
    return selectedMode === "public" ? SUMMARY_STATS : SUMMARY_STATS_ORG;
  }, [selectedMode]);

  // --- Memoized Alerts Filtering ---
  const filteredAlerts = React.useMemo(() => {
    return selectedMode === "public" ? ALERTS : ALERTS_ORG;
  }, [selectedMode]);

  // --- Event Handlers ---
  const handleToggleGas = React.useCallback((gas: string) => {
    const allGasKeys = Object.keys(GAS_CONFIG);
    if (gas === "All") {
      // If "All" is clicked, toggle between all gases and the default single gas ('pm25')
      setSelectedGases(
        selectedGases.length === allGasKeys.length ? ["pm25"] : allGasKeys
      );
    } else {
      // Toggle individual gas selection
      setSelectedGases((prev) => {
        const newSelection = prev.includes(gas)
          ? prev.filter((g) => g !== gas)
          : [...prev, gas];
        // Ensure at least one gas is always selected (optional, adjust as needed)
        return newSelection.length === 0 ? ["pm25"] : newSelection;
      });
    }
  }, [selectedGases.length]); // Dependency ensures callback updates if selection count logic changes implicitly

  const handleSetTimeRange = React.useCallback((newTimeRange: TimeRangeOption) => {
    setTimeRange(newTimeRange);
  }, []);

  const handleNavigateToAlerts = React.useCallback(() => {
    router.push('/alerts');
  }, [router]);

  // --- Render ---
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1"> {/* Assuming Navbar might be part of a Sidebar layout later */}
        <Navbar />

        <main className="p-6 space-y-6"> {/* Added space-y for consistent spacing */}
          {/* Removed redundant section wrappers */}
          <ModeSelector
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
          />

          <SummaryStats stats={filteredSummaryStats} />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ChartSection
              selectedGases={selectedGases}
              timeRange={timeRange}
              filteredData={filteredData}
              gasConfig={GAS_CONFIG}
              onToggleGas={handleToggleGas}
              onSetTimeRange={handleSetTimeRange}
            />

            <MapSection />
          </div>

          <AlertsSection
            alerts={filteredAlerts}
            onViewAllClick={handleNavigateToAlerts}
          />
        </main>
      </div>
    </div>
  );
}
"use client";

// React and Next.js imports
import * as React from "react";
import { useRouter } from "next/navigation";
import type {} from 'react/jsx-runtime';

// Custom hooks imports
import { useDashboardData, useFilteredData, useGasSelection } from "@/hooks/FetchDashboardChart";
import { useDashboardEventHandlers } from "@/utils/dashboardEventHandlers";

// Types and interfaces
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "destructive" | "warning" | "outline";
  timestamp?: string;
}

// Data imports
import {
  GAS_CONFIG,
  SUMMARY_STATS,
  SUMMARY_STATS_ORG,
  ALERTS,
  ALERTS_ORG,
  TimeRangeOption
} from "@/data/dashboardData";

// UI Components imports
import Navbar from "@/components/Navbar/navbar";
import { SummaryStats } from "@/components/Dashboard/SummaryStats";
import { AlertsSection } from "@/components/Alerts/AlertsSection";
import { ModeSelector } from "@/components/Dashboard/ModeSelector";
import { ChartSection } from "@/components/Dashboard/ChartSection";
import { MapSection } from "@/components/Dashboard/MapSection";

export default function DashboardPage() {
  const router = useRouter();

  // --- State Management ---
  const [selectedMode, setSelectedMode] = React.useState<"public" | "organization">("public");
  const [timeRange, setTimeRange] = React.useState<TimeRangeOption>("90d");
  const { selectedGases, toggleGas } = useGasSelection();

  // --- Custom Hooks ---
  const dashboardData = useDashboardData(selectedMode);
  const filteredData = useFilteredData({ timeRange, selectedMode, dashboardData });
  const { handleSetTimeRange, handleNavigateToAlerts } = useDashboardEventHandlers({
    selectedGases,
    setSelectedGases: (setSelectedGases) => { },
    setTimeRange,
    router
  });

  // --- Derived State ---
  const filteredSummaryStats = React.useMemo(() => {
    return selectedMode === "public" ? SUMMARY_STATS : SUMMARY_STATS_ORG;
  }, [selectedMode]);

  const filteredAlerts = React.useMemo(() => {
    return selectedMode === "public" ? ALERTS : ALERTS_ORG;
  }, [selectedMode]);

  // --- Render UI ---
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1">
        <Navbar />

        <main className="p-6 space-y-6">
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
              onToggleGas={toggleGas}
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
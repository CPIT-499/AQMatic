"use client";

// React and Next.js imports
import * as React from "react";
import { useRouter } from "next/navigation";
import type {} from 'react/jsx-runtime';
import { useSession } from "next-auth/react";

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
  FALLBACK_SUMMARY_STATS,
  FALLBACK_ALERTS,
  TimeRangeOption,
  getAQIStatus,
  formatTrendPercent,
  ChartDataPoint
} from "@/data/dashboardData";

// UI Components imports
import Navbar from "@/components/Navbar/navbar";
import { SummaryStats } from "@/components/Dashboard/SummaryStats";
import { AlertsSection } from "@/components/Alerts/AlertsSection";
import { ModeSelector } from "@/components/Dashboard/ModeSelector";
import { ChartSection } from "@/components/Dashboard/ChartSection";
import { MapSection } from "@/components/Dashboard/MapSection";

// Define constants for organization IDs
const PUBLIC_ORG_ID = 1; // Public data organization ID
const DEFAULT_ORG_ID = 7; // Default organization ID for authenticated users

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Get user's organization ID from the session
  const userOrgId = session?.user?.organizationId || DEFAULT_ORG_ID;
  
  // --- State Management ---
  const [selectedMode, setSelectedMode] = React.useState<"public" | "organization">("organization");
  const [timeRange, setTimeRange] = React.useState<TimeRangeOption>("90d");
  const { selectedGases, toggleGas } = useGasSelection();

  // --- Custom Hooks ---
  const dashboardData = useDashboardData(
    selectedMode === "public" ? PUBLIC_ORG_ID : userOrgId
  );
  
  const filteredData = useFilteredData({ timeRange, dashboardData });
  const { handleSetTimeRange, handleNavigateToAlerts } = useDashboardEventHandlers({
    selectedGases,
    setSelectedGases: (setSelectedGases) => { },
    setTimeRange,
    router
  });

  // Log the current organization ID being used for debugging
  React.useEffect(() => {
    console.log(`Dashboard mode: ${selectedMode}, using organization ID:`, 
      selectedMode === "public" ? PUBLIC_ORG_ID : userOrgId);
  }, [selectedMode, userOrgId]);

  // --- Derived State ---
  const filteredSummaryStats = React.useMemo(() => {
    return FALLBACK_SUMMARY_STATS;
  }, [selectedMode]);

  const filteredAlerts = React.useMemo(() => {
    // Map the alert structure to match what AlertsSection expects
    return FALLBACK_ALERTS.map(alert => ({
      ...alert,
      severity: alert.severity as "destructive" | "warning" | "outline"
    }));
  }, [selectedMode]);

  // --- Render UI ---
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1">
        <Navbar />

        <main className="p-8 space-y-8 max-w-[1800px] mx-auto">
          <ModeSelector
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
          />

          <SummaryStats stats={filteredSummaryStats} />

          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 min-h-[600px]">
            <ChartSection
              selectedGases={selectedGases}
              timeRange={timeRange}
              filteredData={filteredData}
              gasConfig={GAS_CONFIG}
              onToggleGas={toggleGas}
              onSetTimeRange={handleSetTimeRange}
            />

            <MapSection orgId={selectedMode === "public" ? PUBLIC_ORG_ID : userOrgId} />
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
"use client";

// React and Next.js imports
import * as React from "react";
import { useRouter } from "next/navigation";
// Removed unused import: import type {} from \'react/jsx-runtime\';
// Removed next-auth import: import { useSession } from "next-auth/react";

// Firebase Auth hook
import { useAuth } from "@/components/auth/firebase-auth-provider";

// Custom hooks imports
import { useGasSelection } from "@/hooks/FetchDashboardChart";

// Services imports
import { fetchDashboardData } from "@/services/api/fetchDashboardData";

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
  FORECAST_DATA,
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
  const { user, loading: authLoading, isOrganizationUser, getOrganizationFromEmail } = useAuth();

  // --- State Management ---\n
  // Determine initial mode based on auth state
  const [selectedMode, setSelectedMode] = React.useState<"public" | "organization">("public");
  const [timeRange, setTimeRange] = React.useState<TimeRangeOption>("90d");
  const { selectedGases, toggleGas } = useGasSelection();

  // --- Data Fetching ---\n
  const [data, setData] = React.useState<{
    chartData: any[];
    mapData: any[];
    summaryStats: any;
    error: string | null;
  } | null>(null);
  const [loadingData, setLoadingData] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Determine the organization ID to fetch data for
  const organizationIdToFetch = selectedMode === "organization" && user && isOrganizationUser(user.email || "") 
    ? getOrganizationFromEmail(user.email || "") // Ideally, fetch based on organization ID/name stored in user claims or fetched from backend
    : PUBLIC_ORG_ID; // Fallback to public data

  React.useEffect(() => {
    // Only fetch data if auth is not loading
    if (!authLoading) {
      setLoadingData(true);
      fetchDashboardData(/* Pass organizationIdToFetch or mode here if API supports it */)
        .then(res => setData(res))
        .catch(err => setFetchError(err instanceof Error ? err.message : String(err)))
        .finally(() => setLoadingData(false));
    }
  }, [selectedMode, authLoading, organizationIdToFetch]); // Re-fetch when mode or auth state changes

  // --- Extract and prepare data for hooks ---\n
  const chartData = data?.chartData ?? [];
  const mapData = data?.mapData ?? [];
  const summaryStats = data?.summaryStats ?? FALLBACK_SUMMARY_STATS;

  // Map raw summaryStats object into array of StatCardProps for SummaryStats
  const statCards = React.useMemo(() => {
    if (Array.isArray(summaryStats)) return summaryStats;
    return [
      {
        title: "Current AQI",
        value: summaryStats.current_aqi,
        status: getAQIStatus(summaryStats.current_aqi),
        trend: { value: formatTrendPercent(summaryStats.aqi_trend_pct), label: "since last period" },
      },
      {
        title: "PM2.5 Level",
        value: summaryStats.pm25_level,
        status: getAQIStatus(summaryStats.pm25_level),
        trend: { value: formatTrendPercent(summaryStats.pm25_trend_pct), label: "since last period" },
      },
      {
        title: "Monitoring Stations",
        value: summaryStats.monitoring_stations,
        status: FALLBACK_SUMMARY_STATS[2].status,
      },
      {
        title: "Alerts Today",
        value: summaryStats.alerts_today,
        status: FALLBACK_SUMMARY_STATS[3].status,
      },
    ];
  }, [summaryStats]);

  // --- Derived Hooks ---\n
  const filteredData = React.useMemo(
    () => chartData.filter(point => true),
    [chartData, timeRange]
  );

  const handleNavigateToAlerts = React.useCallback(() => router.push('/alerts'), [router]);
  const handleSetTimeRange = React.useCallback((range: any) => setTimeRange(range), []);

  const filteredAlerts = React.useMemo(() =>
    FALLBACK_ALERTS.map(alert => ({
      ...alert,
      severity: alert.severity as "destructive" | "warning" | "outline"
    })),
    [selectedMode]
  );

  // Check if the user is authenticated and belongs to an organization to enable the 'Organization' mode
  const canSelectOrganizationMode = user && isOrganizationUser(user.email || "");

  // Handle mode selection, ensuring user is allowed to select 'organization'
  const handleSelectMode = (mode: "public" | "organization") => {
    if (mode === "organization" && !canSelectOrganizationMode) {
      // Optionally redirect to login or show a message
      router.push('/organization'); // Redirect to organization page which handles auth guard
      return;
    }
    setSelectedMode(mode);
  };

  // Combine auth loading and data loading state
  const isLoading = authLoading || loadingData;

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>; // Add a more sophisticated loader if needed
  }
  if (fetchError) {
    return <div className="p-8 text-destructive">Error fetching data: {fetchError}</div>;
  }

  // --- Render UI ---\n
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1">
        <Navbar />

        <main className="p-8 space-y-8 max-w-[1800px] mx-auto">
          <ModeSelector 
            selectedMode={selectedMode} 
            onSelectMode={handleSelectMode} 
            isOrganizationModeAvailable={canSelectOrganizationMode} 
          />

          <SummaryStats stats={statCards} />

          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 min-h-[600px]">
            <ChartSection
              selectedGases={selectedGases}
              timeRange={timeRange}
              filteredData={filteredData}
              forecastData={FORECAST_DATA}
              gasConfig={GAS_CONFIG}
              onToggleGas={toggleGas}
              onSetTimeRange={handleSetTimeRange}
            />

            <MapSection data={mapData} />
          </div>

          <AlertsSection alerts={filteredAlerts} onViewAllClick={handleNavigateToAlerts} />
        </main>
      </div>
    </div>
  );
}
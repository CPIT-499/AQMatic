"use client";

// React and Next.js imports
import * as React from "react";
import { useRouter } from "next/navigation";
import type {} from 'react/jsx-runtime';
import { useSession } from "next-auth/react";

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
  const [selectedMode, setSelectedMode] = React.useState<"public" | "organization">("public");
  const [timeRange, setTimeRange] = React.useState<TimeRangeOption>("90d");
  const { selectedGases, toggleGas } = useGasSelection();

  // --- Data Fetching ---
  const [data, setData] = React.useState<{
    chartData: any[];
    mapData: any[];
    summaryStats: any;
    error: string | null;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fetchDashboardData()
      .then(res => setData(res))
      .catch(err => setFetchError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [selectedMode]);

  // --- Extract and prepare data for hooks ---
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

  // --- Derived Hooks ---
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

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }
  if (fetchError) {
    return <div className="p-8 text-destructive">Error: {fetchError}</div>;
  }

  // --- Render UI ---
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1">
        <Navbar />

        <main className="p-8 space-y-8 max-w-[1800px] mx-auto">
          <ModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />

          <SummaryStats stats={statCards} />

          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 min-h-[600px]">
            <ChartSection
              selectedGases={selectedGases}
              timeRange={timeRange}
              filteredData={filteredData}
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
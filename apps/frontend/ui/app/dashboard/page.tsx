"use client";
// React and Next.js imports
import * as React from "react";
import { useRouter } from "next/navigation";
// Firebase Auth hook
import { useAuth } from "@/components/auth/firebase-auth-provider";

// Custom hooks imports
import { useGasSelection } from "@/hooks/FetchDashboardChart";

// Services imports
import { fetchDashboardData } from "@/services/api/fetchDashboardData";
import { fetchDataForExport, convertDataToCsv } from "@/services/api/exportDataAsCsv";

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
} from "@/data/data_if_no_data";

// UI Components imports
import Navbar from "@/components/Navbar/navbar";
import { SummaryStats } from "@/components/Dashboard/SummaryStats";
import { AlertsSection } from "@/components/Alerts/AlertsSection";
import { ModeSelector } from "@/components/Dashboard/ModeSelector";
import { ChartSection } from "@/components/Dashboard/ChartSection";
import { MapSection } from "@/components/Dashboard/MapSection";
import { Loader2 } from "lucide-react"; // For loading state
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, idTokenResult, getLatestIdToken } = useAuth();

  // --- State Management ---\n
  const [selectedMode, setSelectedMode] = React.useState<"public" | "organization">("public");
  const [timeRange, setTimeRange] = React.useState<TimeRangeOption>("90d");
  const { selectedGases, toggleGas } = useGasSelection();

  // --- Data Fetching ---\n
  const [data, setData] = React.useState<{
    chartData: ChartDataPoint[];
    mapData: any[]; // Use specific MapDataPoint type if available
    forecastData: any[]; // Add this line for forecast data
    summaryStats: any;
    error: string | null;
  } | null>(null);
  const [loadingData, setLoadingData] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Fetch data based on selected mode and auth state
  React.useEffect(() => {
    // Don't fetch until auth state is resolved
    if (authLoading) {
      return;
    }

    const fetchDataForMode = async () => {
      setLoadingData(true);
      setFetchError(null);
      let token: string | null = null;

      // Get token only if requesting organization data and user is logged in
      if (selectedMode === "organization" && user) {
        token = await getLatestIdToken();
        if (!token) {
          console.error("Dashboard: Failed to get token for organization mode.");
          setFetchError("Authentication error. Please try logging in again.");
          setLoadingData(false);
          // Optionally sign out or redirect
          return; 
        }
      }

      try {
        // Pass mode and token to the API fetch function
        const res = await fetchDashboardData(selectedMode, token);
        setData(res);
      } catch (err: any) {
        console.error(`Error fetching ${selectedMode} dashboard data:`, err);
        setFetchError(err.message || `Failed to load ${selectedMode} data.`);
        setData(null); // Clear potentially stale data
      } finally {
        setLoadingData(false);
      }
    };

    fetchDataForMode();
  }, [selectedMode, authLoading, user, getLatestIdToken]); // Dependencies for refetching

  // --- Extract and prepare data for hooks ---
  const chartData = data?.chartData ?? [];
  const mapData = data?.mapData ?? [];
  const forecastData = data?.forecastData ?? []; // Add this line
  const summaryStats = data?.summaryStats ?? FALLBACK_SUMMARY_STATS;

  // Map raw summaryStats object into array of StatCardProps for SummaryStats
  const statCards = React.useMemo(() => {
    if (Array.isArray(summaryStats)) return summaryStats;
    // Ensure fallback values if summaryStats is not the expected object
    const stats = typeof summaryStats === 'object' && summaryStats !== null ? summaryStats : {};
    return [
      {
        title: "Current AQI",
        value: stats.current_aqi ?? FALLBACK_SUMMARY_STATS[0].value,
        status: getAQIStatus(stats.current_aqi ?? FALLBACK_SUMMARY_STATS[0].value),
        trend: { value: formatTrendPercent(stats.aqi_trend_pct), label: "since last period" },
      },
      {
        title: "PM2.5 Level",
        value: stats.pm25_level ?? FALLBACK_SUMMARY_STATS[1].value,
        status: getAQIStatus(stats.pm25_level ?? FALLBACK_SUMMARY_STATS[1].value),
        trend: { value: formatTrendPercent(stats.pm25_trend_pct), label: "since last period" },
      },
      {
        title: "Monitoring Stations",
        value: stats.monitoring_stations ?? FALLBACK_SUMMARY_STATS[2].value,
        status: FALLBACK_SUMMARY_STATS[2].status, // Assuming status is static or derived differently
      },
      {
        title: "Alerts Today",
        value: stats.alerts_today ?? FALLBACK_SUMMARY_STATS[3].value,
        status: FALLBACK_SUMMARY_STATS[3].status, // Assuming status is static or derived differently
      },
    ];
  }, [summaryStats]);

  // --- Derived Hooks ---\n
  const filteredData = React.useMemo(
    () => chartData.filter(point => true), // Add filtering based on timeRange if needed
    [chartData, timeRange]
  );
  const handleNavigateToAlerts = React.useCallback(() => router.push('/alerts'), [router]);
  const handleSetTimeRange = React.useCallback((range: TimeRangeOption) => setTimeRange(range), []);
  
  // State for download button loading
  const [downloadingData, setDownloadingData] = React.useState(false);
    // Handle data download from API
  const handleDownloadData = React.useCallback(async () => {
    try {
      setDownloadingData(true);
      
      // Get token if in organization mode
      let token: string | null = null;
      if (selectedMode === "organization" && user) {
        token = await getLatestIdToken();
      }
      
      // Fetch data using our service
      const exportData = await fetchDataForExport(selectedMode, timeRange, token);
      
      // Convert data to CSV format in the frontend
      const csvContent = convertDataToCsv(exportData, selectedGases);
      
      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      // Create filename with date and time range
      const filename = `air-quality-data-${selectedMode}-${timeRange}-${new Date().toISOString().slice(0,10)}.csv`;
      link.setAttribute("download", filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up to avoid memory leaks
    } catch (error) {
      console.error("Error downloading data:", error);
      // You might want to show an error toast/notification here
    } finally {
      setDownloadingData(false);
    }
  }, [timeRange, selectedMode, user, getLatestIdToken, selectedGases]);

  const filteredAlerts = React.useMemo(() =>
    FALLBACK_ALERTS.map(alert => ({
      ...alert,
      severity: alert.severity as "destructive" | "warning" | "outline"
    })), // Update if alerts should come from fetched data
    [selectedMode]
  );

  // Check if the user has the organization claim to enable the 'Organization' mode
  const canSelectOrganizationMode = !!idTokenResult?.claims?.organization_id;

  // Handle mode selection
  const handleSelectMode = (mode: "public" | "organization") => {
    if (mode === "organization" && !canSelectOrganizationMode) {
      // Should not happen if button is disabled, but good practice
      console.warn("Attempted to select organization mode without claim.");
      // Redirect to organization page which shows login prompt if not authorized
      router.push('/organization'); 
      return;
    }
    setSelectedMode(mode);
  };

  // Combine loading states
  const isLoading = authLoading || loadingData;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  if (fetchError) {
    return <div className="p-8 text-destructive">Error fetching data: {fetchError}</div>;
  }

  // --- Render UI ---\n
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-[1800px] mx-auto w-full">
        <ModeSelector 
          selectedMode={selectedMode} 
          onSelectMode={handleSelectMode} 
          isOrganizationModeAvailable={canSelectOrganizationMode} 
        />

        <SummaryStats stats={statCards} />        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 min-h-[600px]">
          <ChartSection
            selectedGases={selectedGases}
            timeRange={timeRange}
            filteredData={filteredData}
            forecastData={forecastData} // Replace FORECAST_DATA with forecastData
            gasConfig={GAS_CONFIG}
            onToggleGas={toggleGas}
            onSetTimeRange={handleSetTimeRange}
            onDownload={handleDownloadData}
            isDownloading={downloadingData}
          />

          <MapSection data={mapData} />
        </div>

        <AlertsSection alerts={filteredAlerts} onViewAllClick={handleNavigateToAlerts} />
      </main>
    </div>
  );
}
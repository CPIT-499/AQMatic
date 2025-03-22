"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ChevronDown } from "lucide-react"
import dynamic from 'next/dynamic'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Custom component imports
import { SummaryStats } from "@/components/Dashboard/SummaryStats"
import { AlertsSection } from "@/components/Alerts/AlertsSection"
import Navbar from "@/components/Navbar/navbar"

// Dynamically import map component with no server-side rendering
const MapComponentNoSSR = dynamic(
  () => import('@/components/MapComponent/MapComponent'),
  { ssr: false }
);

export type TimeRangeOption = "7d" | "30d" | "90d";

// Sample chart data
const chartData = [
  { date: "Apr 2", pm25: 22, pm10: 60, o3: 35, no2: 15, so2: 8 },
  { date: "Apr 4", pm25: 25, pm10: 70, o3: 38, no2: 18, so2: 10 },
  { date: "Apr 10", pm25: 28, pm10: 75, o3: 42, no2: 20, so2: 12 },
  { date: "Apr 20", pm25: 30, pm10: 85, o3: 45, no2: 22, so2: 14 },
  { date: "Apr 30", pm25: 32, pm10: 90, o3: 48, no2: 25, so2: 15 },
  { date: "May 5", pm25: 35, pm10: 95, o3: 50, no2: 28, so2: 16 },
  { date: "May 15", pm25: 38, pm10: 105, o3: 52, no2: 30, so2: 18 },
  { date: "May 25", pm25: 42, pm10: 120, o3: 55, no2: 32, so2: 20 },
  { date: "Jun 1", pm25: 40, pm10: 110, o3: 53, no2: 30, so2: 19 },
  { date: "Jun 10", pm25: 36, pm10: 100, o3: 50, no2: 28, so2: 17 },
  { date: "Jun 20", pm25: 34, pm10: 95, o3: 48, no2: 26, so2: 16 },
  { date: "Jun 30", pm25: 32, pm10: 90, o3: 45, no2: 24, so2: 15 },
];

// Gas configuration with colors and labels
const gasConfig = {
  pm25: { label: "PM2.5", color: "#10b981" },
  pm10: { label: "PM10", color: "#3b82f6" },
  o3: { label: "O₃", color: "#f59e0b" },
  no2: { label: "NO₂", color: "#ef4444" },
  so2: { label: "SO₂", color: "#8b5cf6" },
};

// Static summary stats and alerts
const SUMMARY_STATS = [
  {
    title: "Current AQI",
    value: 87,
    status: {
      label: "Moderate",
      color: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200"
      }
    },
    trend: {
      value: "+5%",
      label: "from yesterday"
    }
  },
  {
    title: "PM2.5 Level",
    value: 24.3,
    status: {
      label: "Unhealthy",
      color: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-200"
      }
    },
    trend: {
      value: "-2%",
      label: "from yesterday"
    }
  },
  {
    title: "Monitoring Stations",
    value: 6,
    status: {
      label: "All Online",
      color: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200"
      }
    },
    trend: {
      value: "100%",
      label: "uptime"
    }
  },
  {
    title: "Alerts Today",
    value: 3,
    status: {
      label: "Attention Needed",
      color: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200"
      }
    },
    trend: {
      value: "",
      label: "View details"
    }
  }
];

const ALERTS = [
  {
    id: "1",
    severity: "destructive",
    title: "High PM2.5 levels detected in Riyadh",
    description: "Levels exceeded 35μg/m³ for over 2 hours",
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    severity: "warning",
    title: "Ozone levels rising in Jeddah",
    description: "Approaching unhealthy levels for sensitive groups",
    timestamp: "5 hours ago",
    color: "bg-yellow-500"
  },
  {
    id: "3",
    severity: "outline",
    title: "New monitoring station online",
    description: "Station #7 is now operational in Dammam",
    timestamp: "1 day ago",
    color: "bg-green-500"
  }
];

export default function DashboardPage() {
  // State for selected gases and time range
  const [selectedGases, setSelectedGases] = React.useState<string[]>(["pm25"])
  const [timeRange, setTimeRange] = React.useState<TimeRangeOption>("90d")
  const router = useRouter()

  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    if (timeRange === "7d") {
      return chartData.slice(-3); // Last 3 entries for demo
    } else if (timeRange === "30d") {
      return chartData.slice(-7); // Last 7 entries for demo
    }
    return chartData; // Full data for 90d
  }, [timeRange]);

  // Toggle gas selection
  const toggleGas = (gas: string) => {
    if (gas === "All") {
      const allGases = Object.keys(gasConfig);
      setSelectedGases(
        selectedGases.length === allGases.length ? ["pm25"] : allGases
      );
    } else {
      setSelectedGases((prev) => 
        prev.includes(gas) 
          ? prev.filter((g) => g !== gas)
          : [...prev, gas]
      );
    }
  }

  // Navigate to alerts page
  const handleNavigateToAlerts = React.useCallback(() => {
    router.push('/alerts');
  }, [router]);

  // Time range label
  const timeRangeLabel = {
    "90d": "Last 3 months",
    "30d": "Last month",
    "7d": "Last week"
  }[timeRange];

  // Check if all gases are selected
  const allSelected = selectedGases.length === Object.keys(gasConfig).length;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1">
        <Navbar />
        
        <main className="p-6">
          <section>
            <SummaryStats stats={SUMMARY_STATS} />
          </section>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Charts section */}
            <section className="col-span-2">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-row items-center justify-between p-6 pb-2">
                  <div>
                    <h3 className="text-lg font-semibold leading-none tracking-tight">
                      Tracking {selectedGases.length === 1 ? gasConfig[selectedGases[0]].label : "Multiple"} Gas
                      {selectedGases.length > 1 && "es"} Concentrations
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Showing data for the {timeRangeLabel.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Gas selector dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1">
                          {selectedGases.length === 1
                            ? gasConfig[selectedGases[0]].label
                            : allSelected
                              ? "All Gases"
                              : `${selectedGases.length} Selected`}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Select Gases</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem 
                          checked={allSelected} 
                          onCheckedChange={() => toggleGas("All")}
                        >
                          All Gases
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        {Object.entries(gasConfig).map(([key, { label }]) => (
                          <DropdownMenuCheckboxItem
                            key={key}
                            checked={selectedGases.includes(key)}
                            onCheckedChange={() => toggleGas(key)}
                          >
                            {label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* Time range selector dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1">
                          {timeRangeLabel}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {[
                          { value: "7d", label: "Last week" },
                          { value: "30d", label: "Last month" },
                          { value: "90d", label: "Last 3 months" }
                        ].map(option => (
                          <DropdownMenuCheckboxItem 
                            key={option.value}
                            checked={timeRange === option.value} 
                            onCheckedChange={() => setTimeRange(option.value as TimeRangeOption)}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Chart component */}
                <div className="p-6 pt-2">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={filteredData} 
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          {Object.entries(gasConfig).map(([key, { color }]) => (
                            <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-md">
                                  <div className="font-medium">{label}</div>
                                  {payload
                                    .filter((entry) => selectedGases.includes(entry.dataKey as string))
                                    .map((entry, index) => (
                                      <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
                                        <div 
                                          className="h-3 w-3 rounded-full" 
                                          style={{ backgroundColor: entry.color }} 
                                        />
                                        <span className="font-medium">
                                          {gasConfig[entry.dataKey as keyof typeof gasConfig]?.label}:
                                        </span>
                                        <span>{entry.value} μg/m³</span>
                                      </div>
                                    ))}
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend />
                        {selectedGases.map((gas) => (
                          <Area
                            key={gas}
                            type="monotone"
                            dataKey={gas}
                            name={gasConfig[gas as keyof typeof gasConfig]?.label}
                            stroke={gasConfig[gas as keyof typeof gasConfig]?.color}
                            fillOpacity={1}
                            fill={`url(#color${gas})`}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>

            {/* Map section */}
            <section className="col-span-1">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full">
                <div className="flex flex-row items-center justify-between p-4 pb-2 border-b">
                  <div>
                    <h3 className="text-lg font-semibold leading-none tracking-tight">
                      Monitoring Locations
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time air quality across stations
                    </p>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Live Data
                    </Button>
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <MapComponentNoSSR className="w-full h-full" />
                </div>
              </div>
            </section>
          </div>

          {/* Alerts section */}
          <section>
            <AlertsSection
              alerts={ALERTS}
              onViewAllClick={handleNavigateToAlerts}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
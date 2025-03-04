"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import MapHomeStyles from '@/components/MapComponent/MapDashboard.module.css'; // adjust import as needed
import dynamic from 'next/dynamic';

// UI Component imports
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Custom component imports
import { SideNav } from "@/components/Nav/SideNav"
import { DashboardHeader } from "@/components/DashboardHeader/DashboardHeader"
import { SummaryStats } from "@/components/Dashboard/SummaryStats"
import { AlertsSection } from "@/components/Alerts/AlertsSection"
import { AirQualityMap } from "@/components/AirQualityMap/AirQualityMap"
import { GasFilter } from "@/components/GasFilter/GasFilter"
import AreaChartComponent from "@/components/Charts/AreaChartComponent"
import MapComponent from '@/components/MapComponent/MapComponent'
import Navbar from "@/components/Navbar/navbar"

// Icons
import { Bell, Settings, User, BarChart2, Map, Home, Filter, Download } from "lucide-react"

// Data imports
import { chartData } from "@/data/chartData" // Move chartData to a separate file

const MapComponentNoSSR = dynamic(
  () => import('@/components/MapComponent/MapComponent'),
  { ssr: false }
);

interface Alert {
  id: string,
  severity: "destructive" | "warning" | "outline",
  title: string,
  description: string,
  timestamp: string,
  color?: string
}

/**
 * Main Dashboard Page Component
 * Displays air quality monitoring data, statistics, and alerts
 */
export default function DashboardPage() {
  // State management
  const [timeRange, setTimeRange] = React.useState("90d")
  const [showMap, setShowMap] = React.useState(true)
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [activeFilter, setActiveFilter] = React.useState("all")
  const [activeSection, setActiveSection] = React.useState('dashboard')

  const router = useRouter()

  /**
   * Navigation handler
   * @param section - The section to navigate to
   * @param path - The URL path
   */
  const handleNavigation = (section: string, path: string) => {
    setActiveSection(section)
    router.push(path)
  }

  /**
   * Chart configuration based on active filter and time range
   */
  const chartConfig = {
    // Time range labels
    "90d": { label: "3-Month Air Quality Trend" },
    "30d": { label: "Monthly Air Quality Trend" },
    "7d": { label: "Weekly Air Quality Trend" },

    // Primary reading configuration
    desktop: {
      label: activeFilter === "all" ? "Primary Reading" :
        activeFilter === "pm25" ? "PM2.5 Primary" :
          activeFilter === "pm10" ? "PM10 Primary" :
            activeFilter === "o3" ? "Ozone Primary" :
              activeFilter === "no2" ? "NO₂ Primary" : "Primary Reading",
      color: activeFilter === "all" ? "hsl(var(--chart-1))" :
        activeFilter === "pm25" ? "hsl(152, 76%, 36%)" :
          activeFilter === "pm10" ? "hsl(200, 95%, 39%)" :
            activeFilter === "o3" ? "hsl(271, 81%, 56%)" :
              activeFilter === "no2" ? "hsl(349, 89%, 43%)" : "hsl(var(--chart-1))",
    },

    // Secondary reading configuration
    mobile: {
      label: activeFilter === "all" ? "Secondary Reading" :
        activeFilter === "pm25" ? "PM2.5 Secondary" :
          activeFilter === "pm10" ? "PM10 Secondary" :
            activeFilter === "o3" ? "Ozone Secondary" :
              activeFilter === "no2" ? "NO₂ Secondary" : "Secondary Reading",
      color: activeFilter === "all" ? "hsl(var(--chart-2))" :
        activeFilter === "pm25" ? "hsl(152, 76%, 46%)" :
          activeFilter === "pm10" ? "hsl(200, 95%, 49%)" :
            activeFilter === "o3" ? "hsl(271, 81%, 66%)" :
              activeFilter === "no2" ? "hsl(349, 89%, 53%)" : "hsl(var(--chart-2))",
    },

    // Filter descriptions
    all: { label: "Showing combined air quality measurements" },
    pm25: { label: "Monitoring PM2.5 particulate matter levels (μg/m³)" },
    pm10: { label: "Tracking PM10 particulate matter concentrations (μg/m³)" },
    o3: { label: "Measuring Ozone (O₃) levels in the atmosphere (ppb)" },
    no2: { label: "Analyzing Nitrogen Dioxide (NO₂) concentrations (ppb)" }
  } satisfies ChartConfig

  /**
   * Filter and transform chart data based on selected time range and pollutant
   */
  const filteredData = React.useMemo(() => {
    // First filter by time range
    return chartData.filter((item) => {
      const date = new Date(item.date)
      const referenceDate = new Date("2024-06-30")
      const daysToSubtract = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - daysToSubtract)

      return date >= startDate
    }).map(item => {
      // Then transform data based on active pollutant filter
      let transformedItem = { ...item }

      switch (activeFilter) {
        case "pm25":
          transformedItem.desktop = Math.round(item.desktop * 0.8)
          transformedItem.mobile = Math.round(item.mobile * 0.7)
          break
        case "pm10":
          transformedItem.desktop = Math.round(item.desktop * 1.2)
          transformedItem.mobile = Math.round(item.mobile * 1.1)
          break
        case "o3":
          transformedItem.desktop = Math.round(item.desktop * 0.6)
          transformedItem.mobile = Math.round(item.mobile * 0.9)
          break
        case "no2":
          transformedItem.desktop = Math.round(item.desktop * 0.5)
          transformedItem.mobile = Math.round(item.mobile * 0.4)
          break
      }

      return transformedItem
    })
  }, [timeRange, activeFilter])

  /**
   * Summary statistics for the dashboard
   */
  const summaryStats = [
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
  ]

  /**
   * Alert data for the alerts section
   */
  const alerts: Alert[] = [
    {
      id: "1",
      severity: "destructive" as "destructive",
      title: "High PM2.5 levels detected in Riyadh",
      description: "Levels exceeded 35μg/m³ for over 2 hours",
      timestamp: "2 hours ago"
    },
    {
      id: "2",
      severity: "warning" as "warning",
      title: "Ozone levels rising in Jeddah",
      description: "Approaching unhealthy levels for sensitive groups",
      timestamp: "5 hours ago",
      color: "bg-yellow-500"
    },
    {
      id: "3",
      severity: "outline" as "outline",
      title: "New monitoring station online",
      description: "Station #7 is now operational in Dammam",
      timestamp: "1 day ago",
      color: "bg-green-500"
    }
  ]

  return (
    <div className="flex min-h-screen bg-background">
      

      {/* Main content area */}
      <div className="flex-1 md">
        {/* Navigation bar*/}
        <Navbar />

        {/* Main dashboard content */}
        <main className="p-6">
          {/* Summary statistics section */}
          <SummaryStats stats={summaryStats} />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Charts section - spans 2 columns */}
            <div className="col-span-2">
              {/* Gas filter controls */}
              <GasFilter
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              {/* Area chart component */}
              <AreaChartComponent
                data={filteredData}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                chartConfig={chartConfig}
                activeFilter={activeFilter}
              />
            </div>

            {/* Map section - spans 1 column */}
            <div className="col-span-1">
              <section className={MapHomeStyles.mapSection}>
                <div className={MapHomeStyles.container}>
                  <div className={MapHomeStyles.mapCard}>
                    <div className={`${MapHomeStyles.mapWrapper} ${showMap ? MapHomeStyles.mapVisible : MapHomeStyles.mapHidden}`}>
                      <MapComponentNoSSR className="w-full h-full" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Alerts section */}
          <AlertsSection
            alerts={alerts}
            onViewAllClick={() => router.push('/alerts')}
          />
        </main>
      </div>
    </div>
  )
}

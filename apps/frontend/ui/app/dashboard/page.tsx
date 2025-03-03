"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import MapDashboardStyles from '@/components/MapComponent/MapDashboard.module.css'; // adjust import as needed
import MapComponent from '@/components/MapComponent/MapComponent'; // adjust import as needed
import { MainNav } from "@/components/main-nav"
import { Bell, Settings, User, BarChart2, Map, Home, Filter, Download } from "lucide-react"
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
import { useRouter } from "next/navigation";
import AreaChartComponent from "@/components/Charts/AreaChartComponent";
import { SideNav } from "@/components/Nav/SideNav"
import { DashboardHeader } from "@/components/DashboardHeader/DashboardHeader";
import { SummaryStats, StatCardProps } from "@/components/Dashboard/SummaryStats"
import { AlertsSection } from "@/components/Alerts/AlertsSection";
import { AirQualityMap } from "@/components/AirQualityMap/AirQualityMap"
const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [showMap, setShowMap] = React.useState(true)
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [activeFilter, setActiveFilter] = React.useState("all")

  const chartConfig = {
    description: "Showing air quality measurements over time",
    "90d": { label: "3-Month Air Quality Trend" },
    "30d": { label: "Monthly Air Quality Trend" },
    "7d": { label: "Weekly Air Quality Trend" },
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
    all: { label: "Showing combined air quality measurements" },
    pm25: { label: "Monitoring PM2.5 particulate matter levels (μg/m³)" },
    pm10: { label: "Tracking PM10 particulate matter concentrations (μg/m³)" },
    o3: { label: "Measuring Ozone (O₃) levels in the atmosphere (ppb)" },
    no2: { label: "Analyzing Nitrogen Dioxide (NO₂) concentrations (ppb)" }
  } satisfies ChartConfig

  // Filter data based on both time range and active filter
  const filteredData = chartData.filter((item) => {
    // Time range filtering
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    // Only apply time filter if date is within range
    return date >= startDate
  }).map(item => {
    // Apply data transformations based on active filter
    // This simulates different data views based on filter selection
    let transformedItem = {...item}
    
    if (activeFilter === "pm25") {
      transformedItem.desktop = Math.round(item.desktop * 0.8)
      transformedItem.mobile = Math.round(item.mobile * 0.7)
    } else if (activeFilter === "pm10") {
      transformedItem.desktop = Math.round(item.desktop * 1.2)
      transformedItem.mobile = Math.round(item.mobile * 1.1)
    } else if (activeFilter === "o3") {
      transformedItem.desktop = Math.round(item.desktop * 0.6)
      transformedItem.mobile = Math.round(item.mobile * 0.9)
    } else if (activeFilter === "no2") {
      transformedItem.desktop = Math.round(item.desktop * 0.5)
      transformedItem.mobile = Math.round(item.mobile * 0.4)
    }
    
    return transformedItem
  })

  const [activeSection, setActiveSection] = React.useState('dashboard');
  const router = useRouter();

  const handleNavigation = (section: string, path: string) => {
    setActiveSection(section);
    router.push(path);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SideNav />

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Dashboard Header */}
        <DashboardHeader 
          notificationCount={3}
          onNotificationClick={() => setShowNotifications(!showNotifications)}
          onProfileClick={() => router.push('/profile')}
        />

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Summary Stats */}
          <SummaryStats
            stats={[
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
            ]}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-2">
          <AreaChartComponent
            data={filteredData}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            chartConfig={chartConfig}
            activeFilter={activeFilter}
          />
          </div>
          
          <div className="col-span-1">
            <AirQualityMap
              showMap={showMap}
              onToggleMap={() => setShowMap(!showMap)}
            />
          </div>
        </div>

        {/* Alerts Section */}
        <AlertsSection
          alerts={[
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
          ]}
          onViewAllClick={() => router.push('/alerts')}
        />
        </main>
      </div>
    </div>
  )
}

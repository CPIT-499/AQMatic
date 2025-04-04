"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { GasFilterOption, TimeRangeOption } from "@/components/GasFilter/GasFilter"
import { chartData } from "@/data/dashboardData"

interface DataItem {
  date: string;
  desktop: number;
  mobile: number;
}

interface AreaChartComponentProps {
  timeRange: TimeRangeOption
  setTimeRange: (value: TimeRangeOption) => void
  activeFilter: GasFilterOption
  setActiveFilter: (value: GasFilterOption) => void
  chartConfig: ChartConfig
  onDataFiltered: (filteredData: DataItem[]) => void
}

// Define color mapping for specific gases
const gasColors: Record<string, string> = {
  pm25: "hsl(152, 76%, 36%)",
  pm10: "hsl(200, 95%, 39%)",
  o3: "hsl(271, 81%, 56%)",
  no2: "hsl(349, 89%, 43%)",
  mobile: "var(--color-mobile)",
  desktop: "var(--color-desktop)",
  all: "hsl(215, 90%, 50%)" // Default color for "all" filter
}

export default function AreaChartComponent({
  timeRange,
  setTimeRange,
  activeFilter,
  setActiveFilter,
  chartConfig,
  onDataFiltered
}: AreaChartComponentProps) {
  // State for filtered data
  const [filteredData, setFilteredData] = React.useState<Array<{
    date: string;
    desktop: number;
    mobile: number;
  }>>([])

  // Process and filter data when filter or time range changes
  React.useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;
    
    // Filter data by time range
    const filteredByTime = chartData.filter((item) => {
      const date = new Date(item.date)
      const referenceDate = new Date("2024-06-30")
      const daysToSubtract = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - daysToSubtract)

      return date >= startDate
    })

    // Transform data based on active pollutant filter
    const transformedData = filteredByTime.map(item => {
      const transformedItem = { ...item }

      switch (activeFilter) {
        case "pm25":
          // Using fixed multipliers instead of Math.round for consistency
          transformedItem.desktop = Number((item.desktop * 0.8).toFixed(1))
          transformedItem.mobile = Number((item.mobile * 0.7).toFixed(1))
          break
        case "pm10":
          transformedItem.desktop = Number((item.desktop * 1.2).toFixed(1))
          transformedItem.mobile = Number((item.mobile * 1.1).toFixed(1))
          break
        case "o3":
          transformedItem.desktop = Number((item.desktop * 0.6).toFixed(1))
          transformedItem.mobile = Number((item.mobile * 0.9).toFixed(1))
          break
        case "no2":
          transformedItem.desktop = Number((item.desktop * 0.5).toFixed(1))
          transformedItem.mobile = Number((item.mobile * 0.4).toFixed(1))
          break
        case "all":
          // For "all", keep the original values - no transformation needed
          break
        default:
          // Default case - also keep original data
          break
      }

      return transformedItem
    })

    setFilteredData(transformedData)
    onDataFiltered(transformedData)
  }, [timeRange, activeFilter, onDataFiltered])

  // Format the tooltip label for dates
  const formatDate = (value: any) => {
    const date = new Date(value)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-primary/10">
      <CardHeader className="flex items-center gap-6 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>
            {chartConfig[activeFilter]?.label || "Gas Concentration Measurements"}
          </CardTitle>
          <CardDescription>
            {`Showing ${activeFilter === 'all' ? 'all gases' : 
              activeFilter === 'pm25' ? 'PM2.5' : 
              activeFilter === 'pm10' ? 'PM10' : 
              activeFilter === 'o3' ? 'O₃' : 'NO₂'} for the last ${
              timeRange === '90d' ? '3 months' : 
              timeRange === '30d' ? '30 days' : '7 days'
            }`}
          </CardDescription>
        </div>
        
        {/* Gas filter Select */}
        <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as GasFilterOption)}>
          <SelectTrigger
            className="w-[120px] rounded-lg sm:ml-auto"
            aria-label="Select gas filter"
          >
            <SelectValue placeholder="All Gases" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all" className="rounded-lg">All Gases</SelectItem>
            <SelectItem value="pm25" className="rounded-lg">PM2.5</SelectItem>
            <SelectItem value="pm10" className="rounded-lg">PM10</SelectItem>
            <SelectItem value="o3" className="rounded-lg">O₃</SelectItem>
            <SelectItem value="no2" className="rounded-lg">NO₂</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Time range Select */}
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRangeOption)}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
        {filteredData.length > 0 ? (
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSelected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gasColors[activeFilter]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={gasColors[activeFilter]} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={formatDate} />
            <YAxis hide={false} tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={formatDate} indicator="dot" />} />
            {activeFilter === "all" ? (
              <>
                <Area dataKey="mobile" name="Mobile Measurements" type="natural" fill="url(#fillMobile)" stroke={gasColors.mobile} strokeWidth={2} stackId="a" />
                <Area dataKey="desktop" name="Desktop Measurements" type="natural" fill="url(#fillDesktop)" stroke={gasColors.desktop} strokeWidth={2} stackId="a" />
              </>
            ) : (
              <Area dataKey="desktop" name={String(chartConfig[activeFilter]?.label || "Concentration")} type="natural" fill="url(#fillSelected)" stroke={gasColors[activeFilter]} strokeWidth={2} />
            )}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        ) : (
          <div className="flex h-full items-center justify-center">Loading data...</div>
        )}
      </ChartContainer>
    </Card>
  )
}
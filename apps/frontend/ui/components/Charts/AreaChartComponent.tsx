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

// Define measurement data type matching the provided format
interface MeasurementData {
  date: string;
  temperature: number | null;
  humidity: number | null;
  co2: number | null;
  pm25: number | null;
  wind_speed: number | null;
  pm10: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  methane: number | null;
  nitrous_oxide: number | null;
  fluorinated_gases: number | null;
  [key: string]: number | string | null; // Allow dynamic access to properties
}

interface AreaChartComponentProps {
  data: MeasurementData[]; // Accept data directly in the required format
  timeRange: TimeRangeOption;
  setTimeRange: (value: TimeRangeOption) => void;
  activeFilter: GasFilterOption;
  setActiveFilter: (value: GasFilterOption) => void;
  chartConfig: ChartConfig;
}

// Define color mapping for specific gases
const gasColors: Record<string, string> = {
  pm25: "hsl(152, 76%, 36%)",
  pm10: "hsl(200, 95%, 39%)",
  o3: "hsl(271, 81%, 56%)",
  no2: "hsl(349, 89%, 43%)",
  so2: "hsl(32, 89%, 50%)",
  co: "hsl(0, 89%, 43%)",
  all: "hsl(215, 90%, 50%)" // Default color for "all" filter
}

export default function AreaChartComponent({
  data,
  timeRange,
  setTimeRange,
  activeFilter,
  setActiveFilter,
  chartConfig,
}: AreaChartComponentProps) {
  // Filter data based on the selected time range
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Apply time range filter
    const now = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case "7d": startDate.setDate(now.getDate() - 7); break;
      case "30d": startDate.setDate(now.getDate() - 30); break;
      case "90d": startDate.setDate(now.getDate() - 90); break;
      default: startDate.setDate(now.getDate() - 90);
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });
  }, [data, timeRange]);

  // Format date for display in tooltip
  const formatDate = (value: any) => {
    if (!value) return "";
    
    // If value is already in "Apr 10" format, return as is
    if (typeof value === "string" && value.includes(" ")) {
      return value;
    }
    
    // Otherwise format it
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Get display name for the selected gas
  const getGasDisplayName = (gasId: string): string => {
    switch(gasId) {
      case 'pm25': return 'PM2.5';
      case 'pm10': return 'PM10';
      case 'o3': return 'O₃';
      case 'no2': return 'NO₂';
      case 'so2': return 'SO₂';
      case 'co': return 'CO';
      default: return gasId.toUpperCase();
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-primary/10">
      <CardHeader className="flex items-center gap-6 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>
            {activeFilter === 'all' ? 'Gas Concentration Measurements' : `${getGasDisplayName(activeFilter)} Measurements`}
          </CardTitle>
          <CardDescription>
            {`Showing ${activeFilter === 'all' ? 'all gases' : getGasDisplayName(activeFilter)} for the last ${
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
            <SelectItem value="so2" className="rounded-lg">SO₂</SelectItem>
            <SelectItem value="co" className="rounded-lg">CO</SelectItem>
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
              {Object.keys(gasColors).map(gas => (
                <linearGradient key={gas} id={`fill-${gas}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gasColors[gas]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={gasColors[gas]} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={formatDate} />
            <YAxis hide={false} tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={formatDate} indicator="dot" />} />
            
            {activeFilter === "all" ? (
              // Show multiple gas lines when "all" is selected
              <>
                {["pm25", "pm10", "o3", "no2", "so2", "co"].map(gas => (
                  <Area 
                    key={gas}
                    dataKey={gas} 
                    name={getGasDisplayName(gas)} 
                    type="monotone" 
                    fill={`url(#fill-${gas})`}
                    stroke={gasColors[gas]} 
                    strokeWidth={2} 
                    connectNulls 
                  />
                ))}
              </>
            ) : (
              // Show only selected gas
              <Area 
                dataKey={activeFilter} 
                name={getGasDisplayName(activeFilter)} 
                type="monotone" 
                fill={`url(#fill-${activeFilter})`}
                stroke={gasColors[activeFilter]} 
                strokeWidth={2} 
                connectNulls
              />
            )}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        ) : (
          <div className="flex h-full items-center justify-center">No data available</div>
        )}
      </ChartContainer>
    </Card>
  )
}
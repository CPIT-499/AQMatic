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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AreaChartComponentProps {
  data: any[]
  timeRange: string
  setTimeRange: (value: string) => void
  chartConfig: ChartConfig
  activeFilter: string
}

export default function AreaChartComponent({
  data,
  timeRange,
  setTimeRange,
  chartConfig,
  activeFilter,
}: AreaChartComponentProps) {
  // Define gas-specific colors
  const gasColors = {
    pm25: "hsl(152, 76%, 36%)",
    pm10: "hsl(200, 95%, 39%)",
    o3: "hsl(271, 81%, 56%)",
    no2: "hsl(349, 89%, 43%)",
    default: "var(--color-desktop)"
  }

  const getGasColor = () => {
    return gasColors[activeFilter] || gasColors.default
  }

  const getGasUnit = () => {
    switch(activeFilter) {
      case 'pm25':
      case 'pm10':
        return 'μg/m³'
      case 'o3':
      case 'no2':
        return 'ppb'
      default:
        return ''
    }
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-primary/10">
      <CardHeader className="flex flex-col sm:flex-row items-center gap-4 space-y-0 border-b py-6">
        <div className="grid flex-1 gap-2 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold transition-all duration-300">
            {chartConfig[timeRange]?.label || 'Gas Concentration Measurements'} - {data[0]?.date ? new Date(data[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
          </CardTitle>
          <CardDescription className="text-muted-foreground transition-all duration-300">
            {chartConfig[activeFilter]?.description || chartConfig.description || `Monitoring ${activeFilter.toUpperCase()} levels over time (${getGasUnit()})`}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
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
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getGasColor()} stopOpacity={0.8} />
                <stop offset="95%" stopColor={getGasColor()} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{ value: getGasUnit(), angle: -90, position: 'insideLeft' }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="desktop"
              name={chartConfig[activeFilter]?.label || 'Concentration'}
              type="monotone"
              fill="url(#fillGradient)"
              stroke={getGasColor()}
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
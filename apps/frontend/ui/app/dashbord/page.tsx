"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
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

const generateRandomData = () => {
  const data = []
  const startDate = new Date('2024-04-01')
  const endDate = new Date('2024-06-30')

  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    data.push({
      date: date.toISOString().split('T')[0],
      co2: Math.floor(Math.random() * (300 - 150) + 150), // Range: 150-300
      co: Math.floor(Math.random() * (200 - 50) + 50),    // Range: 50-200
      no2: Math.floor(Math.random() * (100 - 30) + 30),   // Range: 30-100
      so2: Math.floor(Math.random() * (60 - 20) + 20),    // Range: 20-60
    })
  }
  return data
}

const chartData = generateRandomData()

const chartConfig = {
  gases: {
    label: "Gases",
  },
  co2: {
    label: "CO₂",
    color: "#EF4444",
  },
  co: {
    label: "CO",
    color: "#10B981",
  },
  no2: {
    label: "NO₂",
    color: "#F59E0B",
  },
  so2: {
    label: "SO₂",
    color: "#6DD987",
  },
} satisfies ChartConfig

export function Component() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
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
    return date >= startDate
  })

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Gas Levels Over Time</CardTitle>
          <CardDescription>
            Showing gas measurements for the last 3 months
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
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
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCO2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-co2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-co2)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-co)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-co)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillNO2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-no2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-no2)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSO2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-so2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-so2)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
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
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="co2"
              type="natural"
              fill="url(#fillCO2)"
              stroke="var(--color-co2)"
              stackId="a"
            />
            <Area
              dataKey="co"
              type="natural"
              fill="url(#fillCO)"
              stroke="var(--color-co)"
              stackId="a"
            />
            <Area
              dataKey="no2"
              type="natural"
              fill="url(#fillNO2)"
              stroke="var(--color-no2)"
              stackId="a"
            />
            <Area
              dataKey="so2"
              type="natural"
              fill="url(#fillSO2)"
              stroke="var(--color-so2)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default Component;

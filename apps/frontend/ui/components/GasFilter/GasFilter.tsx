import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter } from "lucide-react"
import { chartData } from "@/data/data_if_no_data" // Import the data directly

export type GasFilterOption = "all" | "pm25" | "pm10" | "o3" | "no2"
export type TimeRangeOption = "90d" | "30d" | "7d"

interface GasFilterProps {
  activeFilter: GasFilterOption
  timeRange: TimeRangeOption
  onFilterChange: (filter: GasFilterOption) => void
  onTimeRangeChange: (timeRange: TimeRangeOption) => void
  onDataFiltered: (filteredData: any[]) => void // Callback to send filtered data back
}

export function GasFilter({
  activeFilter,
  timeRange,
  onFilterChange,
  onTimeRangeChange,
  onDataFiltered
}: GasFilterProps) {
  // Filter options for gas types
  const filterOptions: { value: GasFilterOption; label: string }[] = [
    { value: "all", label: "All Pollutants" },
    { value: "pm25", label: "PM2.5" },
    { value: "pm10", label: "PM10" },
    { value: "o3", label: "Ozone (O₃)" },
    { value: "no2", label: "NO₂" }
  ]

  // Time range options
  const timeRangeOptions: { value: TimeRangeOption; label: string }[] = [
    { value: "90d", label: "Last 3 Months" },
    { value: "30d", label: "Last Month" },
    { value: "7d", label: "Last Week" }
  ]

  // Process the data when filter or time range changes
  React.useEffect(() => {
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
          case "all":
            // Combine all gases by summing the scaled multipliers
            transformedItem.desktop = Math.round(item.desktop * (0.8 + 1.2 + 0.6 + 0.5))
            transformedItem.mobile = Math.round(item.mobile * (0.7 + 1.1 + 0.9 + 0.4))
            break
      }

      return transformedItem
    })

    // Pass filtered and transformed data back to parent
    onDataFiltered(transformedData)
  }, [activeFilter, timeRange, onDataFiltered])

  return (
  <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-medium">Filter Data</h3>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {/* Gas filter select */}
          <Select value={activeFilter} onValueChange={(value) => onFilterChange(value as GasFilterOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select pollutant" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Time range select */}
          <Select value={timeRange} onValueChange={(value) => onTimeRangeChange(value as TimeRangeOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>
  )
}
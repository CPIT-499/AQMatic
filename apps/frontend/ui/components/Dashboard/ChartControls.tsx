"use client"

import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GasKey, TimeRangeOption, gasConfig } from "@/app/dashboard/DataChart"

interface ChartControlsProps {
  selectedGases: GasKey[]
  allSelected: boolean
  timeRange: TimeRangeOption
  timeRangeLabel: string
  onGasToggle: (gas: string) => void
  onTimeRangeChange: (timeRange: TimeRangeOption) => void
}

export function ChartControls({
  selectedGases,
  allSelected,
  timeRange,
  timeRangeLabel,
  onGasToggle,
  onTimeRangeChange
}: ChartControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Gas selector dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1 min-w-[120px] justify-between">
            <span className="truncate">
              {selectedGases.length === 1
                ? gasConfig[selectedGases[0]].name
                : allSelected
                  ? "All Parameters"
                  : `${selectedGases.length} Selected`}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-[280px]"
          align="end"
          side="bottom"
        >
          <DropdownMenuLabel>Air Quality Parameters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="py-1 px-1">
            <div
              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
              onClick={() => onGasToggle("All")}
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {allSelected && <Check className="h-4 w-4" />}
              </span>
              <span className="font-medium">All Parameters</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-[200px] overflow-y-auto py-1">
            {(Object.keys(gasConfig) as GasKey[]).map((key) => (
              <div
                key={key}
                className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                onClick={() => onGasToggle(key)}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {selectedGases.includes(key) && <Check className="h-4 w-4" />}
                </span>
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: gasConfig[key].color }} 
                    />
                    <span className="font-medium">{gasConfig[key].name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-5">{`${gasConfig[key].unit}, air pollutant`}</p>
                </div>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Time range selector dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1 min-w-[120px] justify-between">
            <span>{timeRangeLabel}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-[200px]"
          align="end"
          side="bottom"
        >
          <DropdownMenuLabel>Time Period</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {[
            { value: "7d", label: "Last week", description: "Data from the past 7 days" },
            { value: "30d", label: "Last month", description: "Data from the past 30 days" },
            { value: "90d", label: "Last 3 months", description: "Data from the past 90 days" }
          ].map(option => (
            <div
              key={option.value}
              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
              onClick={() => onTimeRangeChange(option.value as TimeRangeOption)}
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {timeRange === option.value && <Check className="h-4 w-4" />}
              </span>
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
              </div>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 
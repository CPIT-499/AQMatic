"use client"

import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Calendar } from "lucide-react"
import { TimeRangeOption } from "@/app/dashboard/DataChart"

interface TimePeriodControlProps {
  currentPeriod: TimeRangeOption;
  onChange: (period: TimeRangeOption) => void;
}

export function TimePeriodControl({ currentPeriod, onChange }: TimePeriodControlProps) {
  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={currentPeriod === "30d" ? "default" : "outline"} 
              size="sm"
              onClick={() => onChange("30d")}
            >
              <Calendar className="mr-1 h-3 w-3" />
              Monthly
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View monthly trends</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={currentPeriod === "90d" ? "default" : "outline"} 
              size="sm"
              onClick={() => onChange("90d")}
            >
              <Calendar className="mr-1 h-3 w-3" />
              Quarterly
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View quarterly trends</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={currentPeriod === "1y" ? "default" : "outline"}
              size="sm"
              onClick={() => onChange("1y")}
            >
              <Calendar className="mr-1 h-3 w-3" />
              Yearly
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View yearly trends</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
} 
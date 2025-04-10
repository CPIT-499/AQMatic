"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import { TimePeriodControl } from "./TimePeriodControl"
import { SummaryMetrics } from "./SummaryMetrics" 
import { PollutantTrendsChart } from "./PollutantTrendsChart"
import { RegionComparisonCard } from "./RegionComparisonCard"
import { RecommendationsCard } from "./RecommendationsCard"
import { 
  TimeRangeOption, 
  monthlyPollutantData, 
  regionData, 
  recommendationsData 
} from "@/app/dashboard/DataChart"

interface TrendsTabProps {
  setActiveTab: (value: string) => void
}

export function TrendsTab({ setActiveTab }: TrendsTabProps) {
  const [timePeriod, setTimePeriod] = useState<TimeRangeOption>("90d")
  
  // Handle time period change
  const handleTimePeriodChange = (period: TimeRangeOption) => {
    setTimePeriod(period)
    // In a real application, you would fetch or filter data based on the period
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Long-term Air Quality Trends</CardTitle>
              <CardDescription>Historical data analysis and forecasting</CardDescription>
            </div>
            <TimePeriodControl 
              currentPeriod={timePeriod} 
              onChange={handleTimePeriodChange} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <SummaryMetrics />
          <PollutantTrendsChart data={monthlyPollutantData} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <RegionComparisonCard regions={regionData} />
            <RecommendationsCard recommendations={recommendationsData} />
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => setActiveTab("overview")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
          <Button variant="default">
            <FileText className="mr-2 h-4 w-4" />
            Download Complete Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 
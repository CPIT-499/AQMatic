"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RegionData } from "@/app/dashboard/data"

interface RegionComparisonCardProps {
  regions: RegionData[]
}

export function RegionComparisonCard({ regions }: RegionComparisonCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Yearly Comparison by Region</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center mb-4">
          {regions.map(region => (
            <div key={region.name} className="flex items-center gap-1">
              <div className={`h-3 w-3 rounded-full ${region.color}`}></div>
              <span className="text-sm">{region.name}: {region.value} AQI</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {regions.map(region => (
            <div key={region.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{region.name}</span>
                <Badge variant="outline">{region.value} AQI</Badge>
              </div>
              <div className="bg-muted rounded-full h-2">
                <div className={`${region.color} h-2 rounded-full`} style={{ width: `${region.value}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 
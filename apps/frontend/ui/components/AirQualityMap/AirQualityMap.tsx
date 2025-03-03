"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MapComponent from '@/components/MapComponent/MapComponent'
import MapDashboardStyles from '@/components/MapComponent/MapDashboard.module.css'

export interface AirQualityMapProps {
  showMap: boolean
  onToggleMap: () => void
  className?: string
}

export function AirQualityMap({ showMap, onToggleMap, className = '' }: AirQualityMapProps) {
  return (
    <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 border-primary/10 h-full ${className}`}>
      <CardHeader className="border-b py-6 flex flex-col">
        <CardTitle className="text-2xl font-bold">Air Quality Map</CardTitle>
        <CardDescription className="text-muted-foreground">
          Real-time air quality monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 relative h-[500px] overflow-hidden">
        <div className={`${MapDashboardStyles.mapWrapper} ${showMap ? MapDashboardStyles.mapVisible : MapDashboardStyles.mapHidden}`}>
          <MapComponent className="w-full h-full rounded-b-lg" />
          <div className="absolute bottom-4 right-4 z-10">
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-background/80 backdrop-blur-sm shadow-md"
              onClick={onToggleMap}
            >
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
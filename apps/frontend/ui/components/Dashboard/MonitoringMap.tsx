"use client"

import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'

// Dynamically import map component with no server-side rendering
const MapComponentNoSSR = dynamic(
  () => import('@/components/MapComponent/MapComponent'),
  { ssr: false }
);

export function MonitoringMap() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full">
      <div className="flex flex-row items-center justify-between p-4 pb-2 border-b">
        <div>
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Monitoring Locations
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time air quality across stations
          </p>
        </div>
        <div>
          <Button variant="outline" size="sm" className="text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Live Data
          </Button>
        </div>
      </div>
      <div className="h-[350px] w-full">
        <MapComponentNoSSR className="w-full h-full" />
      </div>
      <div className="p-3 border-t">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-xs">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500"></span>
            <span className="text-xs">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500"></span>
            <span className="text-xs">Unhealthy</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
            <span className="text-xs">Hazardous</span>
          </div>
        </div>
      </div>
    </div>
  )
} 
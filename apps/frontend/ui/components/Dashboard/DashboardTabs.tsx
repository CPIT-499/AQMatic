"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle } from "lucide-react"
import { SummaryStats } from "@/components/Dashboard/SummaryStats"
import { Alert, AlertsSection } from "@/components/Alerts/AlertsSection"
import { GasKey, TimeRangeOption } from "@/app/dashboard/data"
import { GasChart } from "./GasChart"
import { ChartControls } from "./ChartControls"
import { MonitoringMap } from "./MonitoringMap"
import { AlertItem } from "./AlertItem"
import { TrendsTab } from "./TrendsTab"

// Types
interface DashboardTabsProps {
  activeTab: string
  setActiveTab: (value: string) => void
  selectedGases: GasKey[]
  allSelected: boolean
  timeRange: TimeRangeOption
  timeRangeLabel: string
  filteredData: any[]
  toggleGas: (gas: string) => void
  setTimeRange: (value: TimeRangeOption) => void
  stats: any[]
  alerts: Alert[]
  onViewAllAlerts: () => void
}

// Overview Tab Component
function OverviewTab({
  selectedGases,
  allSelected,
  timeRange,
  timeRangeLabel,
  filteredData,
  toggleGas,
  setTimeRange,
  stats,
  alerts,
  onViewAllAlerts
}: Omit<DashboardTabsProps, 'activeTab' | 'setActiveTab'>) {
  return (
    <div className="space-y-6">
      <section>
        <SummaryStats stats={stats} />
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Chart section */}
        <section className="col-span-2">
          <GasChart 
            selectedGases={selectedGases}
            filteredData={filteredData}
            timeRangeLabel={timeRangeLabel}
            timeControls={
              <ChartControls
                selectedGases={selectedGases}
                allSelected={allSelected}
                timeRange={timeRange}
                timeRangeLabel={timeRangeLabel}
                onGasToggle={toggleGas}
                onTimeRangeChange={setTimeRange}
              />
            }
          />
        </section>

        {/* Map section */}
        <section className="col-span-1">
          <MonitoringMap />
        </section>
      </div>
      
      {/* Alerts section */}
      <section>
        <AlertsSection
          alerts={alerts}
          onViewAllClick={onViewAllAlerts}
        />
      </section>
    </div>
  )
}

// Alerts Tab Component
function AlertsTab({ alerts, onViewAllAlerts }: { alerts: Alert[], onViewAllAlerts: () => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle>Recent Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {alerts.map(alert => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={onViewAllAlerts}>
            View All Alerts
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Main Dashboard Tabs Component
export function DashboardTabs({
  activeTab,
  setActiveTab,
  selectedGases,
  allSelected,
  timeRange,
  timeRangeLabel,
  filteredData,
  toggleGas,
  setTimeRange,
  stats,
  alerts,
  onViewAllAlerts
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <OverviewTab
          selectedGases={selectedGases}
          allSelected={allSelected}
          timeRange={timeRange}
          timeRangeLabel={timeRangeLabel}
          filteredData={filteredData}
          toggleGas={toggleGas}
          setTimeRange={setTimeRange}
          stats={stats}
          alerts={alerts}
          onViewAllAlerts={onViewAllAlerts}
        />
      </TabsContent>
      
      <TabsContent value="trends">
        <TrendsTab setActiveTab={setActiveTab} />
      </TabsContent>
      
      <TabsContent value="alerts">
        <AlertsTab alerts={alerts} onViewAllAlerts={onViewAllAlerts} />
      </TabsContent>
    </Tabs>
  )
} 
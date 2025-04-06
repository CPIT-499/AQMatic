"use client"

import { MetricCard } from "./MetricCard"
import { aqiData, pm25Data, complianceData } from "@/app/dashboard/data"

export function SummaryMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <MetricCard
        title="Annual Average AQI"
        value="76.5"
        change="8.2% from last year"
        isPositive={false}
        chartData={aqiData}
        dataKey="aqi"
        color="#3b82f6"
      />
      
      <MetricCard
        title="PM2.5 Concentration"
        value="22.4 µg/m³"
        change="6.5% from last year"
        isPositive={false}
        chartData={pm25Data}
        dataKey="pm"
        color="#10b981"
      />
      
      <MetricCard
        title="Compliance Rate"
        value="82%"
        change="7% from last year"
        isPositive={true}
        chartData={complianceData}
        dataKey="rate"
        color="#8b5cf6"
      />
    </div>
  )
} 
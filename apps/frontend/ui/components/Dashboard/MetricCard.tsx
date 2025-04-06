"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { MetricData } from "@/app/dashboard/data"

export interface MetricCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  chartData: MetricData[]
  dataKey: string
  color: string
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  isPositive, 
  chartData, 
  dataKey, 
  color 
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </span>
            </div>
          </div>
          <div className="h-[80px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
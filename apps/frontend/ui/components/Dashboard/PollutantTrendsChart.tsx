"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { gasConfig } from "@/app/dashboard/data"

interface PollutantTrendsChartProps {
  data: any[]
}

export function PollutantTrendsChart({ data }: PollutantTrendsChartProps) {
  return (
    <Card className="bg-accent/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Annual Pollutant Trends</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="pm25" name="PM2.5" stackId="1" stroke={gasConfig.pm25.color} fill={gasConfig.pm25.color} fillOpacity={0.5} />
              <Area type="monotone" dataKey="pm10" name="PM10" stackId="2" stroke={gasConfig.pm10.color} fill={gasConfig.pm10.color} fillOpacity={0.5} />
              <Area type="monotone" dataKey="o3" name="O₃" stackId="3" stroke={gasConfig.o3.color} fill={gasConfig.o3.color} fillOpacity={0.5} />
              <Area type="monotone" dataKey="no2" name="NO₂" stackId="4" stroke={gasConfig.no2.color} fill={gasConfig.no2.color} fillOpacity={0.5} />
              <Area type="monotone" dataKey="so2" name="SO₂" stackId="5" stroke={gasConfig.so2.color} fill={gasConfig.so2.color} fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 
"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { GasKey, gasConfig } from "@/app/dashboard/DataChart"
import { ReactNode } from "react"

interface GasChartProps {
  selectedGases: GasKey[]
  filteredData: any[]
  timeRangeLabel: string
  timeControls: ReactNode
}

export function GasChart({ 
  selectedGases, 
  filteredData, 
  timeRangeLabel,
  timeControls 
}: GasChartProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <div>
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Tracking {selectedGases.length === 1 ? gasConfig[selectedGases[0]].name : "Multiple"} Gas
            {selectedGases.length > 1 && "es"} Concentrations
          </h3>
          <p className="text-sm text-muted-foreground">
            Showing data for the {timeRangeLabel.toLowerCase()}
          </p>
        </div>
        {timeControls}
      </div>
      
      {/* Chart component */}
      <div className="p-6 pt-2">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={filteredData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                {(Object.keys(gasConfig) as GasKey[]).map((key) => (
                  <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gasConfig[key].color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={gasConfig[key].color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="font-medium mb-1">{label}</div>
                        {payload
                          .filter((entry) => {
                            const dataKey = entry.dataKey as string;
                            return selectedGases.includes(dataKey as GasKey);
                          })
                          .map((entry, index) => {
                            const dataKey = entry.dataKey as GasKey;
                            return (
                              <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{ backgroundColor: entry.color }} 
                                />
                                <span className="font-medium">
                                  {gasConfig[dataKey]?.name}:
                                </span>
                                <span>{entry.value} μg/m³</span>
                              </div>
                            );
                          })}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              {selectedGases.map((gas) => (
                <Area
                  key={gas}
                  type="monotone"
                  dataKey={gas}
                  name={gasConfig[gas].name}
                  stroke={gasConfig[gas].color}
                  fillOpacity={1}
                  fill={`url(#color${gas})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center mt-4 gap-x-6">
          {selectedGases.map((gas) => (
            <div key={gas} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: gasConfig[gas].color }} 
              />
              <span className="text-sm font-medium">{gasConfig[gas].name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
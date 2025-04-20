"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface StatCardProps {
  title: string
  value: string | number
  status: {
    label: string
    color: {
      bg: string
      text: string
      border: string
    }
  }
  trend?: {
    value: string
    label: string
  }
}

export interface SummaryStatsProps {
  stats: StatCardProps[]
  className?: string
}

export function SummaryStats({ stats, className = "" }: SummaryStatsProps) {
  const items = Array.isArray(stats) ? stats : [];
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 ${className}`}>
      {items.map((stat, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-all duration-300 border-primary/10">
          <CardHeader className="pb-2">
            <CardDescription>{stat.title}</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stat.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Badge 
                variant="outline" 
                className={`${stat.status.color.bg} ${stat.status.color.text} ${stat.status.color.border}`}
              >
                {stat.status.label}
              </Badge>
              {stat.trend && (
                <span className="text-xs text-muted-foreground ml-2">
                  {stat.trend.value} {stat.trend.label}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
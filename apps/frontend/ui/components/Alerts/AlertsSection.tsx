"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface Alert {
  id: string
  severity: 'destructive' | 'warning' | 'outline'
  title: string
  description: string
  timestamp: string
  color?: string
}

export interface AlertsSectionProps {
  alerts: Alert[]
  onViewAllClick?: () => void
  className?: string
}

export function AlertsSection({ alerts, onViewAllClick, className = '' }: AlertsSectionProps) {
  return (
    <div className={`mt-6 ${className}`}>
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-primary/10">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-xl font-bold">Recent Alerts</CardTitle>
          <CardDescription className="text-muted-foreground">
            Important notifications about air quality events
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                <Badge 
                  variant={alert.severity} 
                  className={`h-2 w-2 rounded-full p-0 ${alert.color || ''}`} 
                />
                <div className="flex-1">
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
                <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onViewAllClick}
          >
            View All Alerts
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
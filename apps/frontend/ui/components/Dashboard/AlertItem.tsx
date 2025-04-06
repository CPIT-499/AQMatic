"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Alert } from "@/components/Alerts/AlertsSection"

interface AlertItemProps {
  alert: Alert
}

export function AlertItem({ alert }: AlertItemProps) {
  const severityColor = 
    alert.severity === "destructive" ? "bg-red-500" : 
    alert.severity === "warning" ? "bg-yellow-500" : "bg-blue-500";

  return (
    <Card className="border rounded-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 h-2 w-2 rounded-full ${severityColor}`} />
          <div>
            <h4 className="font-medium">{alert.title}</h4>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
            <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
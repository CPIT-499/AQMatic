"use client"

import { AlertTriangle, Info } from "lucide-react"
import { Recommendation as RecommendationType } from "@/app/dashboard/DataChart"

interface RecommendationCardProps {
  recommendation: RecommendationType
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { type, title, description } = recommendation
  
  const styles = {
    warning: {
      bg: "bg-yellow-100/50",
      text: "text-yellow-800",
      textMuted: "text-yellow-700",
      icon: "text-yellow-600",
      IconComponent: AlertTriangle
    },
    info: {
      bg: "bg-blue-100/50",
      text: "text-blue-800",
      textMuted: "text-blue-700",
      icon: "text-blue-600",
      IconComponent: Info
    },
    success: {
      bg: "bg-green-100/50",
      text: "text-green-800",
      textMuted: "text-green-700",
      icon: "text-green-600",
      IconComponent: function CheckIcon(props: any) {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        )
      }
    }
  }

  const style = styles[type]
  const { IconComponent } = style

  return (
    <div className={`flex items-start gap-3 p-2 rounded ${style.bg}`}>
      <div className={`${style.icon} mt-0.5`}>
        <IconComponent width={16} height={16} />
      </div>
      <div className="text-sm">
        <p className={`font-medium ${style.text}`}>{title}</p>
        <p className={`${style.textMuted} mt-1`}>{description}</p>
      </div>
    </div>
  )
} 
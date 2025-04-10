"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RecommendationCard } from "./RecommendationCard"
import { Recommendation } from "@/app/dashboard/DataChart"

interface RecommendationsCardProps {
  recommendations: Recommendation[]
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Forecast and Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard 
              key={`${recommendation.type}-${index}`} 
              recommendation={recommendation}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 
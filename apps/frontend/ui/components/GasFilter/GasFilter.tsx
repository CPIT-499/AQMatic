"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface GasFilterProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function GasFilter({ activeFilter, onFilterChange }: GasFilterProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Button
        variant={activeFilter === "all" ? "secondary" : "outline"}
        className={`transition-all duration-300 ${activeFilter === "all" ? "bg-primary/10" : "hover:bg-primary/5"}`}
        onClick={() => onFilterChange("all")}
      >
        All Measurements
      </Button>
      <Button
        variant={activeFilter === "pm25" ? "secondary" : "outline"}
        className={`transition-all duration-300 ${activeFilter === "pm25" ? "bg-[hsl(152,76%,36%)]/10" : "hover:bg-[hsl(152,76%,36%)]/5"}`}
        onClick={() => onFilterChange("pm25")}
      >
        PM2.5
      </Button>
      <Button
        variant={activeFilter === "pm10" ? "secondary" : "outline"}
        className={`transition-all duration-300 ${activeFilter === "pm10" ? "bg-[hsl(200,95%,39%)]/10" : "hover:bg-[hsl(200,95%,39%)]/5"}`}
        onClick={() => onFilterChange("pm10")}
      >
        PM10
      </Button>
      <Button
        variant={activeFilter === "o3" ? "secondary" : "outline"}
        className={`transition-all duration-300 ${activeFilter === "o3" ? "bg-[hsl(271,81%,56%)]/10" : "hover:bg-[hsl(271,81%,56%)]/5"}`}
        onClick={() => onFilterChange("o3")}
      >
        O₃
      </Button>
      <Button
        variant={activeFilter === "no2" ? "secondary" : "outline"}
        className={`transition-all duration-300 ${activeFilter === "no2" ? "bg-[hsl(349,89%,43%)]/10" : "hover:bg-[hsl(349,89%,43%)]/5"}`}
        onClick={() => onFilterChange("no2")}
      >
        NO₂
      </Button>
    </div>
  )
}
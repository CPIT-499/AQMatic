import * as React from "react";
import { Button } from "@/components/ui/button";

type Mode = "public" | "organization";

interface ModeSelectorProps {
  selectedMode: Mode;
  onSelectMode: (mode: Mode) => void;
}

export function ModeSelector({ selectedMode, onSelectMode }: ModeSelectorProps) {
  return (
    <section className="mb-5">
      <div className="flex flex-col gap-4 mb-2">
        {/* Mode buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            variant={selectedMode === "public" ? "default" : "outline"}
            className="px-6 py-2 rounded-full transition-colors duration-300"
            onClick={() => onSelectMode("public")}
          >
            Public
          </Button>
          <Button
            size="lg"
            variant={selectedMode === "organization" ? "default" : "outline"}
            className="px-6 py-2 rounded-full transition-colors duration-300"
            onClick={() => onSelectMode("organization")}
          >
            Organization
          </Button>
        </div>
        {/* Mode explanation */}
        <div className="text-sm text-muted-foreground">
          <p>
            {selectedMode === "public"
              ? "You are viewing public air quality data available to everyone."
              : "You are viewing organization-specific air quality data."}
          </p>
        </div>
      </div>
    </section>
  );
}
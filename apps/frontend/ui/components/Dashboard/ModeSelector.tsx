import * as React from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

type Mode = "public" | "organization";

interface ModeSelectorProps {
  selectedMode: Mode;
  onSelectMode: (mode: Mode) => void;
  isOrganizationModeAvailable?: boolean;
}

export function ModeSelector({ 
  selectedMode, 
  onSelectMode, 
  isOrganizationModeAvailable = false
}: ModeSelectorProps) {
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
            className="px-6 py-2 rounded-full transition-colors duration-300 disabled:opacity-50"
            onClick={() => onSelectMode("organization")}
            disabled={!isOrganizationModeAvailable}
          >
            <div className="flex items-center gap-2">
              Organization
              {!isOrganizationModeAvailable && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
          </Button>
        </div>
        {/* Mode explanation */}
        <div className="text-sm text-muted-foreground">
          <p>
            {selectedMode === "public"
              ? "You are viewing public air quality data available to everyone."
              : isOrganizationModeAvailable 
                ? "You are viewing organization-specific air quality data."
                : "Sign in with an organization account to view private data."
            }
          </p>
        </div>
      </div>
    </section>
  );
}
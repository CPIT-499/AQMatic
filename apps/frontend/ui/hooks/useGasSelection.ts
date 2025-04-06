import { useState } from "react";
import { GasKey, gasConfig } from "@/app/dashboard/data";

export function useGasSelection() {
  const [selectedGases, setSelectedGases] = useState<GasKey[]>(["pm25"]);

  const allGasKeys = Object.keys(gasConfig) as GasKey[];
  const allSelected = selectedGases.length === allGasKeys.length;

  const toggleGas = (gas: string) => {
    if (gas === "All") {
      setSelectedGases(
        selectedGases.length === allGasKeys.length ? ["pm25"] : allGasKeys
      );
    } else if (Object.keys(gasConfig).includes(gas)) {
      const gasKey = gas as GasKey;
      setSelectedGases((prev) => 
        prev.includes(gasKey) 
          ? prev.filter((g) => g !== gasKey)
          : [...prev, gasKey]
      );
    }
  };

  return {
    selectedGases,
    setSelectedGases,
    toggleGas,
    allSelected
  };
} 
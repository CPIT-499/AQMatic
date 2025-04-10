import { Dispatch, SetStateAction } from 'react';
import { useRouter } from "next/navigation";
import { GAS_CONFIG, TimeRangeOption } from '@/data/dashboardData';

interface DashboardEventHandlersProps {
  selectedGases: string[];
  setSelectedGases: Dispatch<SetStateAction<string[]>>;
  setTimeRange: Dispatch<SetStateAction<TimeRangeOption>>;
  router: any;
}

export const useDashboardEventHandlers = ({
  selectedGases,
  setSelectedGases,
  setTimeRange,
  router
}: DashboardEventHandlersProps) => {
  const handleToggleGas = (gas: string) => {
    const allGasKeys = Object.keys(GAS_CONFIG);
    if (gas === "All") {
      setSelectedGases(
        selectedGases.length === allGasKeys.length ? ["pm25"] : allGasKeys
      );
    } else {
      setSelectedGases((prev) => {
        const newSelection = prev.includes(gas)
          ? prev.filter((g) => g !== gas)
          : [...prev, gas];
        return newSelection.length === 0 ? ["pm25"] : newSelection;
      });
    }
  };

  const handleSetTimeRange = (newTimeRange: TimeRangeOption) => {
    setTimeRange(newTimeRange);
  };

  const handleNavigateToAlerts = () => {
    router.push('/alerts');
  };

  return { handleToggleGas, handleSetTimeRange, handleNavigateToAlerts };
};
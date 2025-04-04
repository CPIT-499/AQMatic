import * as React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChartDataPoint, GasConfig, TimeRangeOption, TIME_RANGE_OPTIONS } from "@/data/dashboardData"; // Adjust path

interface ChartSectionProps {
  selectedGases: string[];
  timeRange: TimeRangeOption;
  filteredData: ChartDataPoint[];
  gasConfig: GasConfig;
  onToggleGas: (gas: string) => void;
  onSetTimeRange: (timeRange: TimeRangeOption) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
  gasConfig: GasConfig;
}

// Define a more specific type for payload items
type PayloadItem = {
  dataKey: string;
  color: string;
  value: number;
  name?: string;
  payload?: Record<string, unknown>;
};

// Custom Tooltip Content Component (optional extraction for clarity)
const CustomTooltip = ({ active, payload, label, gasConfig }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Assuming selectedGases is implicitly handled by the Area components rendered
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <div className="font-medium">{label}</div>
        {payload.map((entry: PayloadItem, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">
              {gasConfig[entry.dataKey as keyof GasConfig]?.label}:
            </span>
            <span>{entry.value} μg/m³</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ChartSection({
  selectedGases,
  timeRange,
  filteredData,
  gasConfig,
  onToggleGas,
  onSetTimeRange,
}: ChartSectionProps) {
  const allGases = Object.keys(gasConfig);
  const allSelected = selectedGases.length === allGases.length;

  const timeRangeLabel = TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label || "Time Range";

  const selectedGasLabel = React.useMemo(() => {
    if (selectedGases.length === 1) return gasConfig[selectedGases[0]].label;
    if (allSelected) return "All Gases";
    return `${selectedGases.length} Selected`;
  }, [selectedGases, gasConfig, allSelected]);

  return (
    <section className="col-span-2">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-6 pb-2">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Tracking {selectedGasLabel} Concentrations
            </h3>
            <p className="text-sm text-muted-foreground">
              Showing data for the {timeRangeLabel.toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Gas Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  {selectedGasLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Select Gases</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={allSelected}
                  onCheckedChange={() => onToggleGas("All")}
                >
                  All Gases
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {allGases.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={selectedGases.includes(key)}
                    onCheckedChange={() => onToggleGas(key)}
                  >
                    {gasConfig[key].label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Time Range Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  {timeRangeLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {TIME_RANGE_OPTIONS.map(option => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={timeRange === option.value}
                    onCheckedChange={() => onSetTimeRange(option.value)}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6 pt-2">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  {Object.entries(gasConfig).map(([key, { color }]) => (
                    <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip gasConfig={gasConfig} />} />
                <Legend />
                {selectedGases.map((gas) => (
                  <Area
                    key={gas}
                    type="monotone"
                    dataKey={gas}
                    name={gasConfig[gas as keyof GasConfig]?.label}
                    stroke={gasConfig[gas as keyof GasConfig]?.color}
                    fillOpacity={1}
                    fill={`url(#color${gas})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
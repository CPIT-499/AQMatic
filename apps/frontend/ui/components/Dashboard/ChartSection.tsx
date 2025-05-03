import * as React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChevronDown, BarChart, LineChart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChartDataPoint, GasConfig, TimeRangeOption, TIME_RANGE_OPTIONS } from "@/data/data_if_no_data"; // Adjust path

interface ChartSectionProps {
  selectedGases: string[];
  timeRange: TimeRangeOption;
  filteredData: ChartDataPoint[];
  forecastData?: ChartDataPoint[]; // New prop for forecast data
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
    // Format the date in the tooltip for better readability
    let formattedDate = label;
    if (typeof label === 'string' && label.includes(' ')) {
      const [month, day] = label.split(' ');
      const currentDate = new Date();
      // Current date is May 3, 2025
      const year = currentDate.getFullYear();
      
      const monthMap: {[key: string]: number} = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const date = new Date(year, monthMap[month], parseInt(day));
      formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      });
    }
    
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <div className="font-medium">{formattedDate}</div>
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
  forecastData = [], // Default to empty array if not provided
  gasConfig,
  onToggleGas,
  onSetTimeRange,
}: ChartSectionProps) {
  const allGases = Object.keys(gasConfig);
  const allSelected = selectedGases.length === allGases.length;
  const [showForecast, setShowForecast] = React.useState(false);

  const timeRangeLabel = TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label || "Time Range";

  const selectedGasLabel = React.useMemo(() => {
    if (selectedGases.length === 1) return gasConfig[selectedGases[0]].label;
    if (allSelected) return "All Gases";
    return `${selectedGases.length} Selected`;
  }, [selectedGases, gasConfig, allSelected]);

  // Filter data based on selected time range
  const timeRangeFilteredData = React.useMemo(() => {
    // Use forecast data if showForecast is true and forecast data is available
    const dataToFilter = showForecast && forecastData.length > 0 ? forecastData : filteredData;
    
    if (!dataToFilter.length) return dataToFilter;
    
    // Get reference date (today)
    const referenceDate = new Date(); // May 3, 2025
    
    // Following the example code's approach for consistent filtering
    return dataToFilter.filter(dataPoint => {
      try {
        // Parse the date from the format in your data (e.g., "Apr 2")
        const [month, day] = dataPoint.date.split(' ');
        
        const monthMap: {[key: string]: number} = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        
        // Create a date object for the datapoint
        const dataDate = new Date(referenceDate.getFullYear(), monthMap[month], parseInt(day));
        
        // If the resulting date is in the future (compared to our reference date)
        // it means this date is from the previous year
        if (dataDate > referenceDate && !showForecast) {
          dataDate.setFullYear(dataDate.getFullYear() - 1);
        }
        
        // Calculate days to subtract based on time range
        let daysToSubtract = 90;
        if (timeRange === '30d') {
          daysToSubtract = 30;
        } else if (timeRange === '7d') {
          daysToSubtract = 7;
        }
        
        // Calculate the start date by subtracting days from reference date
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        
        // Return data points that are newer than or equal to the start date
        return dataDate >= startDate;
      } catch (e) {
        console.error(`Error parsing date: ${dataPoint.date}`, e);
        return false;
      }
    });
  }, [filteredData, forecastData, timeRange, showForecast]);

  // Reverse the data array to flip the date order
  const reversedData = React.useMemo(() => {
    return [...timeRangeFilteredData].reverse();
  }, [timeRangeFilteredData]);

  return (
    <section className="col-span-2 lg:col-span-2 h-full">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full flex flex-col">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-6 pb-4 border-b">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Tracking {selectedGasLabel} Concentrations
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {showForecast ? "AI forecast" : "historical data"} for the {timeRangeLabel.toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Forecast Toggle Button */}
            <Button
              variant={showForecast ? "default" : "outline"}
              size="sm"
              onClick={() => setShowForecast(!showForecast)}
              className="flex items-center gap-1 h-8 px-3"
              disabled={forecastData.length === 0}
            >
              {showForecast ? <LineChart className="h-4 w-4 mr-1" /> : <BarChart className="h-4 w-4 mr-1" />}
              {showForecast ? "AI Forecast" : "Historical"}
            </Button>
            
            {/* Gas Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1 h-8 px-3">
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
                <Button variant="outline" className="flex items-center gap-1 h-8 px-3">
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
        <div className="flex-1 p-6 pt-2">
          <div className="h-full min-h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={showForecast ? forecastData : reversedData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  {Object.entries(gasConfig).map(([key, { color }]) => (
                    <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="90%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => {
                    // Parse the simple date format (e.g., "Apr 2")
                    if (typeof value === 'string') {
                      const [month, day] = value.split(' ');
                      const currentDate = new Date();
                      // Current date is May 3, 2025
                      const year = currentDate.getFullYear();
                      
                      // Create a proper date object for formatting
                      const monthMap: {[key: string]: number} = {
                        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                      };
                      
                      const date = new Date(year, monthMap[month], parseInt(day));
                      
                      // Format based on timeRange to avoid overcrowding
                      if (timeRange === '7d') {
                        // For last week, show the day of week with date for better context
                        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      } else if (timeRange === '30d') {
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      } else {
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
                      }
                    }
                    return value;
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickCount={20} 
                  domain={[0, 250]}
                />
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
                    strokeDasharray={showForecast ? "5 5" : "0"} // Dashed line for forecast data
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
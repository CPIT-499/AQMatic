# SQL Views to Frontend Data Mapping

This document explains how the SQL views in the `DBview` directory map to the frontend data structures in `dashboardData.ts`.

## Overview

Our application uses SQL views to transform raw database data into structures that match our frontend needs. This approach provides several benefits:

1. **Performance**: Database handles aggregation and complex calculations
2. **Consistency**: Ensures consistent calculations across the application
3. **Simplicity**: Frontend code doesn't need to transform data

## SQL Views to TypeScript Types Mapping

### 1. `dashboard_chart_data_view.sql` → `ChartDataPoint`

The `dashboard_chart_data_view` SQL view directly maps to the `ChartDataPoint` interface in the frontend:

**SQL View Structure:**
```sql
SELECT 
    TO_CHAR(date_day, 'Mon DD') AS date,
    o.role,
    MAX(CASE WHEN d.attribute_name = 'pm2.5' THEN d.avg_value ELSE NULL END) AS pm25,
    MAX(CASE WHEN d.attribute_name = 'pm10' THEN d.avg_value ELSE NULL END) AS pm10,
    MAX(CASE WHEN d.attribute_name = 'o3' THEN d.avg_value ELSE NULL END) AS o3,
    -- other pollutants...
FROM daily_data d
JOIN organizations o ON o.role = d.role
GROUP BY date_day, TO_CHAR(date_day, 'Mon DD'), o.role
ORDER BY date_day;
```

**TypeScript Interface:**
```typescript
export interface ChartDataPoint {
  date: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co?: number;
  temperature?: number;
  humidity?: number;
  co2?: number;
  wind_speed?: number;
  methane?: number;
  nitrous_oxide?: number;
  fluorinated_gases?: number;
}
```

**Key Mapping Details:**
- The SQL view formats dates as `'Mon DD'` (e.g., "Apr 15") to match the format used in the frontend
- The view pivots multiple rows of different attributes into columns using `CASE` statements
- Field names (`pm25`, `pm10`, etc.) match exactly between SQL and TypeScript
- Organization role is included to enable filtering by public/private organizations

### 2. `dashboard_summary_stats_view.sql` → `SummaryStat`

The `dashboard_summary_stats_view` provides the data for the summary statistics cards:

**SQL View Calculation:**
```sql
SELECT 
    o.role,
    -- Current AQI (simplified calculation)
    ROUND(
        GREATEST(
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'pm2.5' THEN cd.value * 2 END), 0),
            -- other pollutants...
        )
    ) as current_aqi,
    
    -- PM2.5 current level
    ROUND(MAX(CASE WHEN cd.attribute_name = 'pm2.5' THEN cd.value END)::numeric, 1) as pm25_level,
    
    -- AQI trend from yesterday (percentage)
    ROUND(
        (current_calculation - yesterday_calculation) / 
        NULLIF(yesterday_calculation, 0) * 100
    ) as aqi_trend_pct,
    
    -- other calculations...
FROM organizations o
LEFT JOIN current_data cd ON o.organization_id = cd.organization_id AND cd.rn = 1
-- other joins...
GROUP BY o.organization_id, o.role, sd.active_stations, ad.alert_count;
```

**TypeScript Interface:**
```typescript
export interface SummaryStat {
  title: string;
  value: number | string;
  status: {
    label: string;
    color: {
      bg: string;
      text: string;
      border: string;
    };
  };
  trend: {
    value: string;
    label: string;
  };
}
```

**Key Mapping Details:**
- The SQL view calculates numeric values that get mapped to the `value` field in `SummaryStat`
- The view provides raw numbers that the frontend transforms into formatted values
- Percentage trends calculated in SQL (`aqi_trend_pct`, `pm25_trend_pct`) are used for the `trend.value` field
- The frontend adds labels and color coding based on the numeric values

### 3. `map_data_view.sql` → Map Component Data

The `map_data_view` provides geospatial data for the map visualization:

**SQL View Structure:**
```sql
SELECT 
    l.location_id,
    l.latitude,
    l.longitude,
    l.city,
    l.region,
    l.country,
    MAX(CASE WHEN lm.attribute_name = 'pm2.5' THEN lm.value ELSE NULL END) as pm25,
    -- other pollutants...
    -- Calculate intensity value for heatmap
    GREATEST(
        COALESCE(MAX(CASE WHEN lm.attribute_name = 'pm2.5' THEN lm.value / 50.0 ELSE 0 END), 0),
        -- other normalized values...
    ) as intensity
FROM locations l
LEFT JOIN latest_measurements lm ON l.location_id = lm.location_id AND lm.rn = 1
GROUP BY l.location_id, l.latitude, l.longitude, l.city, l.region, l.country;
```

**Frontend Usage:**
This view's data is used to populate:
1. Heatmap layer using the `intensity` value with the Leaflet heatmap plugin
2. Location markers with popups displaying city names and pollutant values
3. Custom color scaling based on AQI intensity

**Key Mapping Details:**
- The SQL view calculates a normalized `intensity` value (0-1 scale) that's directly used for heatmap coloring
- Location coordinates (`latitude`, `longitude`) are used to position markers on the map
- City/region/country metadata is used for popups and tooltips
- Pollutant values are displayed in marker popups

### 4. `hourly_measurement_summary_View_graph.sql` → Time Series Data

This view provides raw time series data that can be used for detailed charts:

**SQL View Structure:**
```sql
SELECT 
    m.measurement_time,  
    ma.attribute_name,
    m.value,
    ma.unit,
    o.organization_name,
    o.role
FROM measurements m
JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
JOIN locations l ON m.location_id = l.location_id
JOIN organizations o ON m.organization_id = o.organization_id
WHERE m.measurement_time >= CURRENT_DATE - INTERVAL '90 days';
```

**Frontend Usage:**
This view provides more granular time series data that can be used for:
1. Detailed time series charts with hourly resolution
2. Filtering by specific attributes or time ranges
3. Comparing data across different organizations

**Key Mapping Details:**
- The SQL view provides raw data that needs additional transformation in the frontend
- Time values need formatting to match the frontend's expected date format
- Attribute names need to be mapped to the frontend's expected field names
- Units are provided to display appropriate labels on charts

## Using the Views in the Frontend

To replace the hardcoded data in `dashboardData.ts` with real data from these views:

1. Create API endpoints that query these views
2. Fetch data from these endpoints in your React components
3. Transform the API responses into the expected TypeScript interfaces if needed
4. Update your state management to use the fetched data

Example API fetch:
```typescript
// Function to fetch chart data from the API
export async function fetchChartData(timeRange: TimeRangeOption): Promise<ChartDataPoint[]> {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const response = await fetch(`/api/dashboard-chart-data?days=${days}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }
  
  return response.json();
}
```

This approach completely eliminates the need for hardcoded sample data in `dashboardData.ts`. 
# Database Views

A collection of SQL views used to transform raw database data into structured formats for the AQMatic dashboard.

## View Descriptions

### hourly_measurement_summary_View_graph.sql
Raw measurement data from the past 90 days with minimal transformation. Provides time-series data with attribute names, units, and organization details.

### dashboard_chart_data_view.sql
Transforms measurements into dashboard chart format. Aggregates data by day and pivots attribute rows into columns (pm25, pm10, etc.) with formatted dates.

### dashboard_summary_stats_view.sql
Calculates dashboard summary statistics:
- Current AQI values based on multiple pollutants
- PM2.5 levels with trend percentages
- Active monitoring station counts 
- Alert counts by threshold violation

### map_data_view.sql
Prepares geospatial data for map visualization:
- Latest measurement values for each location
- Normalized intensity values (0-1 scale) for heatmap coloring
- Location metadata for markers and popups

### alerts_view.sql
Identifies and formats air quality alerts:
- Classifies severity based on threshold values
- Generates human-readable alert titles and descriptions
- Calculates relative timestamps
- Prioritizes alerts by severity and recency

## AQI View

The `aqi_view.sql` provides raw pollutant values for all gases from the measurement_attributes table. This view:

1. Retrieves the most recent measurements for each location
2. Includes all relevant pollutants: PM2.5, PM10, O3, NO2, SO2, CO, CO2, Methane, Nitrous Oxide, and Fluorinated gases
3. Does not perform any AQI calculations (these should be calculated in your application code)

### Key Features

- Provides the latest value for each pollutant by location
- Includes location and organization context
- Simple structure for easy querying

### Usage Example

```sql
-- Get raw pollutant data for all locations
SELECT city, region, pm25_value, pm10_value, o3_value FROM aqi_view;

-- Get detailed pollutant data for a specific location
SELECT 
    city, 
    pm25_value,
    o3_value,
    co2_value,
    methane_value
FROM aqi_view 
WHERE location_id = 123;
```

## Usage

Query these views directly to retrieve formatted data:

```sql
-- Example: Get current AQI for public organizations
SELECT current_aqi, pm25_level FROM dashboard_summary_stats_view WHERE role = 'public'

-- Example: Get map data points
SELECT latitude, longitude, intensity FROM map_data_view

-- Example: Get top 5 alerts
SELECT severity, title, description FROM alerts_view ORDER BY severity DESC LIMIT 5
``` 
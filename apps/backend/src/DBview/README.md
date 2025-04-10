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
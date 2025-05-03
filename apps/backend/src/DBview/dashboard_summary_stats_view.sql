-- This view provides summary stats for the dashboard display with improved timestamp handling.
-- It gets the most recent pollutant measurements and compares to the closest available
-- previous data point to ensure trend calculations are always possible.
-- The view also counts active monitoring stations and current alerts.
CREATE OR REPLACE VIEW dashboard_summary_stats_view AS
WITH current_data AS (
    -- Get the most recent measurements with minimal processing
    -- Cast all timestamps to TIMESTAMP WITHOUT TIME ZONE for consistency
    SELECT 
        m.organization_id,
        ma.attribute_name,
        m.value,
        o.role,
        m.measurement_time::TEXT::TIMESTAMP as measurement_time, -- Double cast to handle any timestamp format
        ROW_NUMBER() OVER (PARTITION BY m.organization_id, ma.attribute_name ORDER BY m.measurement_time DESC) as rn
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time >= (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMP
    AND ma.attribute_name IN ('pm2.5', 'pm10', 'o3', 'no2', 'so2', 'co')
),
current_data_times AS (
    -- Extract just the measurement times of the most recent readings
    SELECT 
        organization_id,
        attribute_name,
        measurement_time as current_time
    FROM current_data
    WHERE rn = 1
),
previous_data AS (
    -- Find measurements older than current but within last 14 days
    -- Using simplified comparison logic
    SELECT 
        m.organization_id,
        ma.attribute_name,
        m.value,
        o.role,
        m.measurement_time::TEXT::TIMESTAMP as measurement_time, -- Double cast to handle any timestamp format
        c.current_time,
        -- Safe timestamp difference calculation
        EXTRACT(EPOCH FROM (c.current_time::TIMESTAMP - m.measurement_time::TIMESTAMP)) / 3600 as hours_difference
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    JOIN current_data_times c ON 
        m.organization_id = c.organization_id AND 
        ma.attribute_name = c.attribute_name
    WHERE 
        -- Simple text-based comparison to avoid timestamp type conflicts
        m.measurement_time::TEXT < (c.current_time - INTERVAL '1 hour')::TEXT
        AND m.measurement_time::TEXT > (CURRENT_DATE - INTERVAL '14 days')::TEXT
),
closest_previous AS (
    -- Find closest previous measurement for each current reading
    SELECT
        organization_id,
        attribute_name,
        value,
        role,
        measurement_time,
        current_time,
        hours_difference,
        -- Simple numerical ranking by hours difference
        ROW_NUMBER() OVER (
            PARTITION BY organization_id, attribute_name
            ORDER BY hours_difference ASC
        ) as rank
    FROM previous_data
),
stations_data AS (
    -- Count active monitoring stations
    SELECT 
        o.organization_id,
        o.role,
        COUNT(DISTINCT s.sensor_id) as active_stations
    FROM sensors s
    JOIN organizations o ON s.organization_id = o.organization_id
    WHERE EXISTS (
        SELECT 1 FROM measurements m -- only include sensors with recent measurements
        WHERE m.sensor_id = s.sensor_id 
        AND m.measurement_time >= (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMP
    )
    GROUP BY o.organization_id, o.role
)
SELECT 
    o.organization_id,
    o.role,
    
    -- Raw current measurements
    AVG(CASE WHEN cd.attribute_name = 'pm2.5' AND cd.rn = 1 THEN cd.value ELSE NULL END) as pm25_current,
    AVG(CASE WHEN cd.attribute_name = 'pm10' AND cd.rn = 1 THEN cd.value ELSE NULL END) as pm10_current,
    AVG(CASE WHEN cd.attribute_name = 'o3' AND cd.rn = 1 THEN cd.value ELSE NULL END) as o3_current,
    AVG(CASE WHEN cd.attribute_name = 'no2' AND cd.rn = 1 THEN cd.value ELSE NULL END) as no2_current,
    AVG(CASE WHEN cd.attribute_name = 'so2' AND cd.rn = 1 THEN cd.value ELSE NULL END) as so2_current,
    AVG(CASE WHEN cd.attribute_name = 'co' AND cd.rn = 1 THEN cd.value ELSE NULL END) as co_current,
    
    -- Raw previous measurements (using the closest available data)
    AVG(CASE WHEN cp.attribute_name = 'pm2.5' AND cp.rank = 1 THEN cp.value END) as pm25_previous,
    AVG(CASE WHEN cp.attribute_name = 'pm10' AND cp.rank = 1 THEN cp.value END) as pm10_previous,
    AVG(CASE WHEN cp.attribute_name = 'o3' AND cp.rank = 1 THEN cp.value END) as o3_previous,
    AVG(CASE WHEN cp.attribute_name = 'no2' AND cp.rank = 1 THEN cp.value END) as no2_previous,
    AVG(CASE WHEN cp.attribute_name = 'so2' AND cp.rank = 1 THEN cp.value END) as so2_previous,
    AVG(CASE WHEN cp.attribute_name = 'co' AND cp.rank = 1 THEN cp.value END) as co_previous,
    
    -- Hours since the previous measurements
    AVG(CASE WHEN cp.attribute_name = 'pm2.5' AND cp.rank = 1 THEN cp.hours_difference END) as pm25_hours_diff,
    AVG(CASE WHEN cp.attribute_name = 'pm10' AND cp.rank = 1 THEN cp.hours_difference END) as pm10_hours_diff,
    AVG(CASE WHEN cp.attribute_name = 'o3' AND cp.rank = 1 THEN cp.hours_difference END) as o3_hours_diff,
    AVG(CASE WHEN cp.attribute_name = 'no2' AND cp.rank = 1 THEN cp.hours_difference END) as no2_hours_diff,
    AVG(CASE WHEN cp.attribute_name = 'so2' AND cp.rank = 1 THEN cp.hours_difference END) as so2_hours_diff,
    AVG(CASE WHEN cp.attribute_name = 'co' AND cp.rank = 1 THEN cp.hours_difference END) as co_hours_diff,
    
    -- Active monitoring stations count
    COALESCE(sd.active_stations, 0) as monitoring_stations,
    
    -- Count alerts based on EPA Air Quality Index thresholds for "Unhealthy for Sensitive Groups" category
    -- These values represent the AQI breakpoint thresholds that trigger health alerts
    COUNT(CASE WHEN cd.attribute_name = 'pm2.5' AND cd.value > 35 THEN 1 END) + -- PM2.5 > 35 μg/m3 (AQI > 100)
    COUNT(CASE WHEN cd.attribute_name = 'pm10' AND cd.value > 150 THEN 1 END) + -- PM10 > 150 μg/m3 (AQI > 100)
    COUNT(CASE WHEN cd.attribute_name = 'o3' AND cd.value > 70 THEN 1 END) +    -- Ozone > 70 ppb (AQI > 100)
    COUNT(CASE WHEN cd.attribute_name = 'no2' AND cd.value > 100 THEN 1 END) +  -- NO2 > 100 ppb (AQI > 100)
    COUNT(CASE WHEN cd.attribute_name = 'so2' AND cd.value > 75 THEN 1 END)     -- SO2 > 75 ppb (AQI > 100)
    as alerts_today
FROM organizations o
LEFT JOIN current_data cd ON o.organization_id = cd.organization_id
LEFT JOIN closest_previous cp ON 
    o.organization_id = cp.organization_id AND 
    cd.attribute_name = cp.attribute_name AND 
    cd.rn = 1
LEFT JOIN stations_data sd ON o.organization_id = sd.organization_id
GROUP BY o.organization_id, o.role, sd.active_stations;
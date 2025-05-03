-- This view provides summary stats for the dashboard display.
-- It gets the most recent pollutant measurements and compares to yesterday.
-- If yesterday's data is missing, it smartly falls back to the most recent
-- available data from the past week to ensure trend calculations are possible.
-- The view also counts active monitoring stations and current alerts.
CREATE OR REPLACE VIEW dashboard_summary_stats_view AS
WITH current_data AS (
    -- Get the most recent measurements with minimal processing
    SELECT 
        m.organization_id,
        ma.attribute_name,
        m.value,
        o.role,
        m.measurement_time,
        ROW_NUMBER() OVER (PARTITION BY m.organization_id, ma.attribute_name ORDER BY m.measurement_time DESC) as rn
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time >= CURRENT_DATE - INTERVAL '1 day'
    AND ma.attribute_name IN ('pm2.5', 'pm10', 'o3', 'no2', 'so2', 'co')
),
yesterday_data AS (
    -- First attempt to get data from exactly yesterday
    SELECT 
        m.organization_id,
        ma.attribute_name,
        m.value,
        o.role,
        m.measurement_time,
        1 as priority -- Priority 1 for exact yesterday data
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time BETWEEN CURRENT_DATE - INTERVAL '2 days' AND CURRENT_DATE - INTERVAL '1 day'
    AND ma.attribute_name IN ('pm2.5', 'pm10', 'o3', 'no2', 'so2', 'co')
    
    UNION ALL
    
    -- If no yesterday data, fall back to older data (up to last week)
    SELECT 
        m.organization_id,
        ma.attribute_name,
        m.value,
        o.role,
        m.measurement_time,
        2 as priority -- Priority 2 for older fallback data
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE - INTERVAL '2 days'
    AND ma.attribute_name IN ('pm2.5', 'pm10', 'o3', 'no2', 'so2', 'co')
    -- Only include these rows if no yesterday data exists
    AND NOT EXISTS (
        SELECT 1 
        FROM measurements m2 
        JOIN measurement_attributes ma2 ON m2.attribute_id = ma2.attribute_id
        WHERE m2.organization_id = m.organization_id 
        AND ma2.attribute_name = ma.attribute_name
        AND m2.measurement_time BETWEEN CURRENT_DATE - INTERVAL '2 days' AND CURRENT_DATE - INTERVAL '1 day'
    )
),
yesterday_best_data AS (
    -- Select the best yesterday data (either exact or closest fallback)
    SELECT
        organization_id,
        attribute_name,
        value,
        role,
        measurement_time
    FROM (
        SELECT 
            organization_id,
            attribute_name,
            value,
            role,
            measurement_time,
            ROW_NUMBER() OVER (PARTITION BY organization_id, attribute_name ORDER BY priority, measurement_time DESC) as rn
        FROM yesterday_data
    ) ranked
    WHERE rn = 1
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
        AND m.measurement_time >= CURRENT_DATE - INTERVAL '1 day' -- within the last day
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
    
    -- Raw yesterday measurements (using the best available data)
    AVG(CASE WHEN ybd.attribute_name = 'pm2.5' THEN ybd.value END) as pm25_yesterday,
    AVG(CASE WHEN ybd.attribute_name = 'pm10' THEN ybd.value END) as pm10_yesterday,
    AVG(CASE WHEN ybd.attribute_name = 'o3' THEN ybd.value END) as o3_yesterday,
    AVG(CASE WHEN ybd.attribute_name = 'no2' THEN ybd.value END) as no2_yesterday,
    AVG(CASE WHEN ybd.attribute_name = 'so2' THEN ybd.value END) as so2_yesterday,
    AVG(CASE WHEN ybd.attribute_name = 'co' THEN ybd.value END) as co_yesterday,
    
    -- Active monitoring stations count
    COALESCE(sd.active_stations, 0) as monitoring_stations,
    
    -- Count alerts (keeping simple raw count of high readings)
    COUNT(CASE WHEN cd.attribute_name = 'pm2.5' AND cd.value > 35 THEN 1 END) +
    COUNT(CASE WHEN cd.attribute_name = 'pm10' AND cd.value > 150 THEN 1 END) +
    COUNT(CASE WHEN cd.attribute_name = 'o3' AND cd.value > 70 THEN 1 END) +
    COUNT(CASE WHEN cd.attribute_name = 'no2' AND cd.value > 100 THEN 1 END) +
    COUNT(CASE WHEN cd.attribute_name = 'so2' AND cd.value > 75 THEN 1 END) as alerts_today
FROM organizations o
LEFT JOIN current_data cd ON o.organization_id = cd.organization_id
LEFT JOIN yesterday_best_data ybd ON o.organization_id = ybd.organization_id AND ybd.attribute_name = cd.attribute_name
LEFT JOIN stations_data sd ON o.organization_id = sd.organization_id
GROUP BY o.organization_id, o.role, sd.active_stations;
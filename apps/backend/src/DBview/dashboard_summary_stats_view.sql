CREATE OR REPLACE VIEW dashboard_summary_stats_view AS
WITH current_data AS (
    -- Get the most recent measurements for AQI calculation
    SELECT 
        m.organization_id,
        ma.attribute_name,
        m.value,
        o.role,
        ROW_NUMBER() OVER (PARTITION BY m.organization_id, ma.attribute_name ORDER BY m.measurement_time DESC) as rn
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time >= CURRENT_DATE - INTERVAL '1 day'
    AND ma.attribute_name IN ('pm2.5', 'pm10', 'o3', 'no2', 'so2')
),
yesterday_data AS (
    -- Get yesterday's measurements for comparison
    SELECT 
        m.organization_id,
        ma.attribute_name,
        AVG(m.value) as avg_value,
        o.role
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time BETWEEN CURRENT_DATE - INTERVAL '2 days' AND CURRENT_DATE - INTERVAL '1 day'
    AND ma.attribute_name IN ('pm2.5', 'pm10', 'o3', 'no2', 'so2')
    GROUP BY m.organization_id, ma.attribute_name, o.role
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
        SELECT 1 FROM measurements m 
        WHERE m.sensor_id = s.sensor_id 
        AND m.measurement_time >= CURRENT_DATE - INTERVAL '1 day'
    )
    GROUP BY o.organization_id, o.role
),
alerts_data AS (
    -- Count number of alerts per organization (simulated - replace with actual alert logic)
    SELECT 
        o.organization_id,
        o.role,
        COUNT(*) as alert_count
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time >= CURRENT_DATE - INTERVAL '1 day'
    AND (
        (ma.attribute_name = 'pm2.5' AND m.value > 35) OR
        (ma.attribute_name = 'pm10' AND m.value > 150) OR
        (ma.attribute_name = 'o3' AND m.value > 70) OR
        (ma.attribute_name = 'no2' AND m.value > 100) OR
        (ma.attribute_name = 'so2' AND m.value > 75)
    )
    GROUP BY o.organization_id, o.role
)
SELECT 
    o.role,
    -- Current AQI (simplified calculation)
    ROUND(
        GREATEST(
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'pm2.5' THEN cd.value * 2 END), 0),
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'pm10' THEN cd.value / 2 END), 0),
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'o3' THEN cd.value END), 0),
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'no2' THEN cd.value / 2 END), 0),
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'so2' THEN cd.value END), 0)
        )
    ) as current_aqi,
    
    -- PM2.5 current level
    ROUND(MAX(CASE WHEN cd.attribute_name = 'pm2.5' THEN cd.value END)::numeric, 1) as pm25_level,
    
    -- AQI trend from yesterday (percentage)
    ROUND(
        (GREATEST(
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'pm2.5' THEN cd.value * 2 END), 0),
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'pm10' THEN cd.value / 2 END), 0),
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'o3' THEN cd.value END), 0),
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'no2' THEN cd.value / 2 END), 0),
            COALESCE(MAX(CASE WHEN cd.attribute_name = 'so2' THEN cd.value END), 0)
        ) - 
        GREATEST(
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'pm2.5' THEN yd.avg_value * 2 END), 0),
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'pm10' THEN yd.avg_value / 2 END), 0),
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'o3' THEN yd.avg_value END), 0),
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'no2' THEN yd.avg_value / 2 END), 0),
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'so2' THEN yd.avg_value END), 0)
        )) / NULLIF(GREATEST(
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'pm2.5' THEN yd.avg_value * 2 END), 0),
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'pm10' THEN yd.avg_value / 2 END), 0),
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'o3' THEN yd.avg_value END), 0),
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'no2' THEN yd.avg_value / 2 END), 0),
            COALESCE(MAX(CASE WHEN yd.attribute_name = 'so2' THEN yd.avg_value END), 0)
        ), 0) * 100
    ) as aqi_trend_pct,
    
    -- PM2.5 trend from yesterday (percentage)
    ROUND(
        (MAX(CASE WHEN cd.attribute_name = 'pm2.5' THEN cd.value END) - 
         MAX(CASE WHEN yd.attribute_name = 'pm2.5' THEN yd.avg_value END)) / 
        NULLIF(MAX(CASE WHEN yd.attribute_name = 'pm2.5' THEN yd.avg_value END), 0) * 100
    ) as pm25_trend_pct,
    
    -- Active monitoring stations
    COALESCE(sd.active_stations, 0) as monitoring_stations,
    
    -- Alerts today
    COALESCE(ad.alert_count, 0) as alerts_today
FROM organizations o
LEFT JOIN current_data cd ON o.organization_id = cd.organization_id AND cd.rn = 1
LEFT JOIN yesterday_data yd ON o.organization_id = yd.organization_id AND yd.attribute_name = cd.attribute_name
LEFT JOIN stations_data sd ON o.organization_id = sd.organization_id
LEFT JOIN alerts_data ad ON o.organization_id = ad.organization_id
GROUP BY o.organization_id, o.role, sd.active_stations, ad.alert_count; 
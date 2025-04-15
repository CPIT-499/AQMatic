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
    -- Get yesterday's raw measurements
    SELECT 
        m.organization_id,
        ma.attribute_name,
        m.value,
        o.role,
        m.measurement_time
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time BETWEEN CURRENT_DATE - INTERVAL '2 days' AND CURRENT_DATE - INTERVAL '1 day'
    AND ma.attribute_name IN ('pm2.5', 'pm10', 'o3', 'no2', 'so2', 'co')
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
)
SELECT 
    o.organization_id,
    o.role,
    
    -- Raw current measurements
    MAX(CASE WHEN cd.attribute_name = 'pm2.5' AND cd.rn = 1 THEN cd.value END) as pm25_current,
    MAX(CASE WHEN cd.attribute_name = 'pm10' AND cd.rn = 1 THEN cd.value END) as pm10_current,
    MAX(CASE WHEN cd.attribute_name = 'o3' AND cd.rn = 1 THEN cd.value END) as o3_current,
    MAX(CASE WHEN cd.attribute_name = 'no2' AND cd.rn = 1 THEN cd.value END) as no2_current,
    MAX(CASE WHEN cd.attribute_name = 'so2' AND cd.rn = 1 THEN cd.value END) as so2_current,
    MAX(CASE WHEN cd.attribute_name = 'co' AND cd.rn = 1 THEN cd.value END) as co_current,
    
    -- Raw yesterday measurements (using averages)
    AVG(CASE WHEN yd.attribute_name = 'pm2.5' THEN yd.value END) as pm25_yesterday,
    AVG(CASE WHEN yd.attribute_name = 'pm10' THEN yd.value END) as pm10_yesterday,
    AVG(CASE WHEN yd.attribute_name = 'o3' THEN yd.value END) as o3_yesterday,
    AVG(CASE WHEN yd.attribute_name = 'no2' THEN yd.value END) as no2_yesterday,
    AVG(CASE WHEN yd.attribute_name = 'so2' THEN yd.value END) as so2_yesterday,
    AVG(CASE WHEN yd.attribute_name = 'co' THEN yd.value END) as co_yesterday,
    
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
LEFT JOIN yesterday_data yd ON o.organization_id = yd.organization_id AND yd.attribute_name = cd.attribute_name
LEFT JOIN stations_data sd ON o.organization_id = sd.organization_id
GROUP BY o.organization_id, o.role, sd.active_stations; 
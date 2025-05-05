CREATE OR REPLACE VIEW dashboard_summary_stats_view AS
WITH current_data AS (
    -- Get most recent measurements per organization and attribute
    SELECT 
        m.organization_id,
        o.role,
        ma.attribute_name,
        m.value,
        m.measurement_time,
        ROW_NUMBER() OVER (PARTITION BY m.organization_id, ma.attribute_name 
                          ORDER BY m.measurement_time DESC) as rn
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time >= (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMP
    AND ma.attribute_name IN ('pm2.5', 'pm10', 'o3', 'no2', 'so2', 'co')
),
previous_data AS (
    -- Get reference measurements from previous day for trend calculation
    SELECT 
        m.organization_id,
        ma.attribute_name,
        m.value,
        m.measurement_time
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    WHERE m.measurement_time BETWEEN 
          (CURRENT_DATE - INTERVAL '2 days')::TIMESTAMP AND 
          (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMP
    AND ma.attribute_name IN ('pm2.5', 'pm10', 'o3', 'no2', 'so2', 'co')
),
stations AS (
    -- station count
    SELECT 
        o.organization_id,
        COUNT(DISTINCT l.location_id) as station_count
    FROM locations l
    JOIN measurements m ON l.location_id = m.location_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time >= (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMP
    GROUP BY o.organization_id
)
SELECT 
    o.organization_id,
    o.role,
    
    -- Current pollutant values
    AVG(CASE WHEN cd.attribute_name = 'pm2.5' AND cd.rn = 1 THEN cd.value END) as pm25_current,
    AVG(CASE WHEN cd.attribute_name = 'pm10' AND cd.rn = 1 THEN cd.value END) as pm10_current,
    AVG(CASE WHEN cd.attribute_name = 'o3' AND cd.rn = 1 THEN cd.value END) as o3_current,
    AVG(CASE WHEN cd.attribute_name = 'no2' AND cd.rn = 1 THEN cd.value END) as no2_current,
    AVG(CASE WHEN cd.attribute_name = 'so2' AND cd.rn = 1 THEN cd.value END) as so2_current,
    AVG(CASE WHEN cd.attribute_name = 'co' AND cd.rn = 1 THEN cd.value END) as co_current,
    
    -- Previous day values (for trend calculation)
    (SELECT AVG(pd.value) FROM previous_data pd 
     WHERE pd.organization_id = o.organization_id AND pd.attribute_name = 'pm2.5') as pm25_previous,
    (SELECT AVG(pd.value) FROM previous_data pd 
     WHERE pd.organization_id = o.organization_id AND pd.attribute_name = 'pm10') as pm10_previous,
    (SELECT AVG(pd.value) FROM previous_data pd 
     WHERE pd.organization_id = o.organization_id AND pd.attribute_name = 'o3') as o3_previous,
    (SELECT AVG(pd.value) FROM previous_data pd 
     WHERE pd.organization_id = o.organization_id AND pd.attribute_name = 'no2') as no2_previous,
    (SELECT AVG(pd.value) FROM previous_data pd 
     WHERE pd.organization_id = o.organization_id AND pd.attribute_name = 'so2') as so2_previous,
    (SELECT AVG(pd.value) FROM previous_data pd 
     WHERE pd.organization_id = o.organization_id AND pd.attribute_name = 'co') as co_previous,
    
    -- Station count
    COALESCE(s.station_count, 0) as monitoring_stations,
    
    -- Alert count based on EPA thresholds
    (
        SELECT COUNT(*)
        FROM current_data alert
        WHERE alert.organization_id = o.organization_id
        AND alert.rn = 1
        AND (
            (alert.attribute_name = 'pm2.5' AND alert.value > 35) OR
            (alert.attribute_name = 'pm10' AND alert.value > 150) OR
            (alert.attribute_name = 'o3' AND alert.value > 70) OR
            (alert.attribute_name = 'no2' AND alert.value > 100) OR
            (alert.attribute_name = 'so2' AND alert.value > 75)
        )
    ) as alerts_today
    
FROM organizations o
LEFT JOIN current_data cd ON o.organization_id = cd.organization_id
LEFT JOIN stations s ON o.organization_id = s.organization_id
GROUP BY o.organization_id, o.role, s.station_count;

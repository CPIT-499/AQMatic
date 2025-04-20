CREATE OR REPLACE VIEW map_data_view AS
WITH latest_measurements AS (
    SELECT 
        m.location_id,
        ma.attribute_name,
        m.value,
        ROW_NUMBER() OVER (PARTITION BY m.location_id, ma.attribute_name ORDER BY m.measurement_time DESC) as rn
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    WHERE m.measurement_time >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
    l.location_id,
    l.latitude,
    l.longitude,
    l.city,
    l.region,
    l.country,
    -- Air quality measurements
    MAX(CASE WHEN lm.attribute_name = 'pm2.5' THEN lm.value ELSE NULL END) as pm25,
    MAX(CASE WHEN lm.attribute_name = 'pm10' THEN lm.value ELSE NULL END) as pm10,
    MAX(CASE WHEN lm.attribute_name = 'o3' THEN lm.value ELSE NULL END) as o3,
    MAX(CASE WHEN lm.attribute_name = 'no2' THEN lm.value ELSE NULL END) as no2,
    MAX(CASE WHEN lm.attribute_name = 'so2' THEN lm.value ELSE NULL END) as so2,
    MAX(CASE WHEN lm.attribute_name = 'co' THEN lm.value ELSE NULL END) as co,
    -- Weather measurements
    MAX(CASE WHEN lm.attribute_name = 'temperature' THEN lm.value ELSE NULL END) as temperature,
    MAX(CASE WHEN lm.attribute_name = 'humidity' THEN lm.value ELSE NULL END) as humidity,
    MAX(CASE WHEN lm.attribute_name = 'wind_speed' THEN lm.value ELSE NULL END) as wind_speed,
    -- Greenhouse gases
    MAX(CASE WHEN lm.attribute_name = 'co2' THEN lm.value ELSE NULL END) as co2,
    MAX(CASE WHEN lm.attribute_name = 'methane' THEN lm.value ELSE NULL END) as methane,
    MAX(CASE WHEN lm.attribute_name = 'nitrous_oxide' THEN lm.value ELSE NULL END) as nitrous_oxide,
    MAX(CASE WHEN lm.attribute_name = 'fluorinated_gases' THEN lm.value ELSE NULL END) as fluorinated_gases,
    -- Calculate AQI based on the pollutant with highest intensity (simplified version)
    -- This formula creates a 0-1 scale value that can be used for heatmap intensity
    GREATEST(
        COALESCE(MAX(CASE WHEN lm.attribute_name = 'pm2.5' THEN lm.value / 50.0 ELSE 0 END), 0),
        COALESCE(MAX(CASE WHEN lm.attribute_name = 'pm10' THEN lm.value / 150.0 ELSE 0 END), 0),
        COALESCE(MAX(CASE WHEN lm.attribute_name = 'o3' THEN lm.value / 100.0 ELSE 0 END), 0),
        COALESCE(MAX(CASE WHEN lm.attribute_name = 'no2' THEN lm.value / 150.0 ELSE 0 END), 0),
        COALESCE(MAX(CASE WHEN lm.attribute_name = 'so2' THEN lm.value / 200.0 ELSE 0 END), 0)
    ) as intensity
FROM locations l
LEFT JOIN latest_measurements lm ON l.location_id = lm.location_id AND lm.rn = 1
GROUP BY l.location_id, l.latitude, l.longitude, l.city, l.region, l.country; 
CREATE OR REPLACE VIEW dashboard_chart_data_view AS
WITH daily_data AS (
    SELECT 
        DATE_TRUNC('day', m.measurement_time) AS date_day,
        ma.attribute_name,
        AVG(m.value) AS avg_value,
        o.role
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('day', m.measurement_time), ma.attribute_name, o.role
)
SELECT 
    TO_CHAR(date_day, 'Mon DD') AS date,
    o.role,
    MAX(CASE WHEN d.attribute_name = 'pm2.5' THEN d.avg_value ELSE NULL END) AS pm25,
    MAX(CASE WHEN d.attribute_name = 'pm10' THEN d.avg_value ELSE NULL END) AS pm10,
    MAX(CASE WHEN d.attribute_name = 'o3' THEN d.avg_value ELSE NULL END) AS o3,
    MAX(CASE WHEN d.attribute_name = 'no2' THEN d.avg_value ELSE NULL END) AS no2,
    MAX(CASE WHEN d.attribute_name = 'so2' THEN d.avg_value ELSE NULL END) AS so2,
    MAX(CASE WHEN d.attribute_name = 'co' THEN d.avg_value ELSE NULL END) AS co,
    MAX(CASE WHEN d.attribute_name = 'temperature' THEN d.avg_value ELSE NULL END) AS temperature,
    MAX(CASE WHEN d.attribute_name = 'humidity' THEN d.avg_value ELSE NULL END) AS humidity,
    MAX(CASE WHEN d.attribute_name = 'co2' THEN d.avg_value ELSE NULL END) AS co2,
    MAX(CASE WHEN d.attribute_name = 'wind_speed' THEN d.avg_value ELSE NULL END) AS wind_speed,
    MAX(CASE WHEN d.attribute_name = 'methane' THEN d.avg_value ELSE NULL END) AS methane,
    MAX(CASE WHEN d.attribute_name = 'nitrous_oxide' THEN d.avg_value ELSE NULL END) AS nitrous_oxide,
    MAX(CASE WHEN d.attribute_name = 'fluorinated_gases' THEN d.avg_value ELSE NULL END) AS fluorinated_gases
FROM daily_data d
JOIN organizations o ON o.role = d.role
GROUP BY date_day, TO_CHAR(date_day, 'Mon DD'), o.role
ORDER BY date_day; 
CREATE OR REPLACE VIEW hourly_measurement_summary_View_graph AS
WITH daily_measurements AS (
    SELECT 
        DATE_TRUNC('day', m.measurement_time) as measurement_time,
        ma.attribute_name,
        AVG(m.value) as avg_value,
        ma.unit,
        o.organization_name,
        o.role
    FROM measurements m
    JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
    JOIN locations l ON m.location_id = l.location_id
    JOIN organizations o ON m.organization_id = o.organization_id
    WHERE m.measurement_time >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('day', m.measurement_time), ma.attribute_name, ma.unit, o.organization_name, o.role
)
SELECT 
    measurement_time,
    attribute_name,
    avg_value as value,
    unit,
    organization_name,
    role
FROM daily_measurements
ORDER BY measurement_time DESC;

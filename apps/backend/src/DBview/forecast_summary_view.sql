CREATE OR REPLACE VIEW forecast_summary_view AS
WITH forecast_data AS (
    SELECT 
        DATE_TRUNC('day', f.target_time) as target_time,
        ma.attribute_name,
        f.predicted_value as value,
        ma.unit,
        o.organization_name,
        o.organization_id,
        o.role,
        f.horizon_days,
        f.forecast_time
    FROM forecasts f
    JOIN measurement_attributes ma ON f.attribute_id = ma.attribute_id
    JOIN organizations o ON f.organization_id = o.organization_id
    WHERE f.target_time >= CURRENT_DATE
    AND f.target_time <= CURRENT_DATE + INTERVAL '30 days'
)
SELECT 
    target_time,
    attribute_name,
    value,
    unit,
    organization_name,
    organization_id,
    role,
    horizon_days,
    forecast_time
FROM forecast_data
ORDER BY target_time, organization_id, attribute_name;
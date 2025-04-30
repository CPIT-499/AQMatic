CREATE OR REPLACE VIEW forecast_summary_view_graph AS
WITH daily_forecasts AS (
    SELECT 
        f.target_time,
        ma.attribute_name,
        AVG(f.predicted_value) as avg_value,
        ma.unit,
        o.organization_name,
        o.organization_id,
        o.role,
        f.horizon_days
    FROM forecasts f
    JOIN measurement_attributes ma ON f.attribute_id = ma.attribute_id
    JOIN organizations o ON f.organization_id = o.organization_id
    WHERE f.target_time >= CURRENT_DATE - INTERVAL '90 days'
      AND f.target_time <= CURRENT_DATE + INTERVAL '30 days'  -- Include forecasts up to 30 days in the future
    GROUP BY f.target_time, ma.attribute_name, ma.unit, o.organization_name, o.organization_id, o.role, f.horizon_days
)
SELECT 
    target_time as forecast_date,
    attribute_name,
    avg_value as predicted_value,
    unit,
    organization_name,
    organization_id,
    role,
    horizon_days as forecast_horizon
FROM daily_forecasts
ORDER BY target_time ASC, horizon_days ASC;
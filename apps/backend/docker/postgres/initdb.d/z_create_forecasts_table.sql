
-- Create forecasts table for air quality predictions
CREATE TABLE IF NOT EXISTS forecasts (
    forecast_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(organization_id),
    attribute_id INTEGER NOT NULL REFERENCES measurement_attributes(attribute_id),
    horizon_days INTEGER NOT NULL,
    forecast_time TIMESTAMP NOT NULL,
    target_time DATE NOT NULL,
    predicted_value NUMERIC NOT NULL,
    
    -- Create an index for faster queries on common lookup patterns
    CONSTRAINT unique_forecast UNIQUE (organization_id, attribute_id, horizon_days, target_time)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS forecasts_org_attr_idx ON forecasts(organization_id, attribute_id);
CREATE INDEX IF NOT EXISTS forecasts_target_time_idx ON forecasts(target_time);
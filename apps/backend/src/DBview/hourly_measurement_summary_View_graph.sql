CREATE OR REPLACE VIEW hourly_measurement_summary_View_graph AS
SELECT 
    m.measurement_time,  
    ma.attribute_name,
    m.value,
    ma.unit,
    o.organization_name,
    o.role
FROM measurements m
JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
JOIN locations l ON m.location_id = l.location_id
JOIN organizations o ON m.organization_id = o.organization_id
WHERE m.measurement_time >= CURRENT_DATE - INTERVAL '90 days';
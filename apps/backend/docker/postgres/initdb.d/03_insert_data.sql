-- First, insert organizations
INSERT INTO organizations (organization_name, contact_email, contact_phone, address, website)
VALUES 
    ('APSCO', 'info@apsco.com', '+966123456789', '123 APSCO Rd', 'www.apsco.com'), -- Added APSCO
    ('OpenWeatherMap', 'Null', 'Null', 'Null', 'openweathermap.org', 'public'),
    ('OpenMeteo', 'Null', 'Null', 'Null', 'open-meteo.com', 'public'),
    ('PurpleAir', 'Null', 'Null', 'Null', 'purpleair.com', 'public');

-- Next, insert locations
INSERT INTO locations (latitude, longitude, city, country, region)
VALUES
    (24.5247, 39.5692, 'Medina', 'Saudi Arabia', 'Al Madinah Region'),
    (21.5433, 39.1728, 'Jeddah', 'Saudi Arabia', 'Makkah Region'),
    (21.3891, 39.8579, 'Mecca', 'Saudi Arabia', 'Makkah Region'),
    (26.4207, 50.0888, 'Dammam', 'Saudi Arabia', 'Eastern Province'),
    (21.4267, 40.4833, 'Taif', 'Saudi Arabia', 'Makkah Region'),
    (21.4901, 39.1862, 'Jeddah', 'Saudi Arabia', 'Makkah Region'),
    (24.7136, 46.6753, 'Riyadh', 'Saudi Arabia', 'Riyadh Region');

-- Then measurement attributes
INSERT INTO measurement_attributes (attribute_id, attribute_name, unit)
VALUES 
  (1, 'temperature', '°C'),
  (2, 'humidity', '%'),
  (3, 'co2', 'ppm'),
  (4, 'pm2.5', 'µg/m³'),
  (5, 'wind_speed', 'm/s'),
  (6, 'pm10', 'µg/m³'),
  (7, 'no2', 'ppb'),
  (8, 'so2', 'ppb'),
  (9, 'co', 'ppm'),
  (10, 'o3', 'ppb'),
  (11, 'methane', 'ppb'),
  (12, 'nitrous_oxide', 'ppb'),
  (13, 'fluorinated_gases', 'ppt');

-- Now sensors (which depend on organizations and locations)
INSERT INTO sensors (organization_id, sensor_type, model, deployment_date, default_location_id, vehicle_id, drone_model, station_name, operator_name)
VALUES 
  (1, 'Weather Station', 'WS-3000', '2023-01-15', 1, NULL, NULL, 'Portland HQ Station', 'John Green'),
  (2, 'Drone Sensor', 'DS-AirPro', '2023-03-20', 2, NULL, 'DJI Phantom 4', NULL, 'Dave Drone'),
  (3, 'Air Quality', 'AQM-45', '2023-05-10', 3, 'VAN-789', NULL, 'Sydney Mobile Unit', 'Sarah Sky'),
  (4, 'Marine Sensor', 'MS-DeepBlue', '2023-07-01', 4, NULL, NULL, 'Miami Coastal Station', 'Mike Marine'),
  (5, 'Alpine Climate', 'AC-1000', '2023-09-12', 5, NULL, NULL, 'Zurich Alpine Station', 'Anna Alpine'),
  (1, 'Weather Station', 'APSCO-WX1', '2023-02-10', 1, NULL, NULL, 'Medina Central Station', 'Ahmed Ali'),
  (1, 'Air Quality', 'APSCO-AQ200', '2023-03-15', 2, NULL, NULL, 'Jeddah Corniche Station', 'Fatima Saad'),
  (1, 'Drone Sensor', 'APSCO-DS100', '2023-04-20', 3, NULL, 'DJI Mavic 3', NULL, 'Khalid Omar'),
  (1, 'Mobile Sensor', 'APSCO-MS50', '2023-05-05', 7, 'KSA-1234', NULL, 'Riyadh Mobile Unit', 'Ahmed Ali');

-- Finally users (which depend on organizations)
-- Added name (derived from username) and "emailVerified" (set to NOW()) for Auth.js compatibility
-- Update all users to have consistent, plain text passwords for testing
INSERT INTO users (organization_id, username, password_hash, email, role, name, "emailVerified")
VALUES
  (1, 'john_green', 'password123', 'john@greenearth.org', 'admin', 'John Green', NOW()),
  (1, 'emily_eco', 'password123', 'emily@greenearth.org', 'viewer', 'Emily Eco', NOW()),
  (2, 'dave_drone', 'password123', 'dave@skydrones.com', 'operator', 'Dave Drone', NOW()),
  (3, 'sarah_sky', 'password123', 'sarah@urbanair.io', 'admin', 'Sarah Sky', NOW()),
  (4, 'mike_marine', 'password123', 'mike@oceanwatch.org', 'viewer', 'Mike Marine', NOW()),
  (1, 'ahmed_ali', 'password123', 'ahmed@apsco.com', 'admin', 'Ahmed Ali', NOW()),
  (1, 'fatima_saad', 'password123', 'fatima@apsco.com', 'operator', 'Fatima Saad', NOW()),
  (1, 'khalid_omar', 'password123', 'khalid@apsco.com', 'viewer', 'Khalid Omar', NOW());

-- Add some measurement data for APSCO sensors
INSERT INTO measurements (sensor_id, organization_id, measurement_time, location_id, attribute_id, value)
VALUES
  -- Medina Weather Station (sensor_id = 6, from the new inserts)
  (6, 1, NOW() - INTERVAL '1 hour', 1, 1, 35.2),  -- temperature
  (6, 1, NOW() - INTERVAL '1 hour', 1, 2, 45.6),  -- humidity
  (6, 1, NOW() - INTERVAL '1 hour', 1, 5, 3.2),   -- wind_speed
  
  -- Jeddah Air Quality Station (sensor_id = 7)
  (7, 1, NOW() - INTERVAL '2 hours', 2, 4, 18.7), -- pm2.5
  (7, 1, NOW() - INTERVAL '2 hours', 2, 6, 42.3), -- pm10
  (7, 1, NOW() - INTERVAL '2 hours', 2, 7, 35.1), -- no2
  
  -- Mecca Drone Sensor (sensor_id = 8)
  (8, 1, NOW() - INTERVAL '3 hours', 3, 3, 412.5), -- co2
  (8, 1, NOW() - INTERVAL '3 hours', 3, 8, 12.3),  -- so2
  (8, 1, NOW() - INTERVAL '3 hours', 3, 10, 48.9), -- o3
  
  -- Riyadh Mobile Unit (sensor_id = 9)
  (9, 1, NOW() - INTERVAL '4 hours', 7, 4, 24.6), -- pm2.5
  (9, 1, NOW() - INTERVAL '4 hours', 7, 9, 1.2),  -- co
  (9, 1, NOW() - INTERVAL '4 hours', 7, 11, 1820.5); -- methane
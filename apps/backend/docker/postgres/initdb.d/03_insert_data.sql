-- First, insert organizations
INSERT INTO organizations (organization_name, contact_email, contact_phone, address, website)
VALUES 
  ('OpenWeatherMap', 'Null', 'Null', 'Null', 'https://openweathermap.org'),
  ('Open-Meteo', 'Null', 'Null', 'Null', 'https://open-meteo.com'),
  ('GreenEarth', 'contact@greenearth.org', '+1234567890', '123 Earth St', 'www.greenearth.org'),
  ('SkyDrones', 'info@skydrones.com', '+2345678901', '456 Sky Ave', 'www.skydrones.com'),
  ('UrbanAir', 'contact@urbanair.io', '+3456789012', '789 Urban Blvd', 'www.urbanair.io'),
  ('OceanWatch', 'info@oceanwatch.org', '+4567890123', '101 Ocean Dr', 'www.oceanwatch.org'),
  ('AlpineMonitor', 'info@alpinemonitor.org', '+5678901234', '202 Alpine Way', 'www.alpinemonitor.org');

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
  (5, 'Alpine Climate', 'AC-1000', '2023-09-12', 5, NULL, NULL, 'Zurich Alpine Station', 'Anna Alpine');

-- Finally users (which depend on organizations)
-- Added name (derived from username) and "emailVerified" (set to NOW()) for Auth.js compatibility
INSERT INTO users (organization_id, username, password_hash, email, role, name, "emailVerified")
VALUES
  (1, 'john_green', 'hash1', 'john@greenearth.org', 'admin', 'John Green', NOW()),
  (1, 'emily_eco', 'hash2', 'emily@greenearth.org', 'viewer', 'Emily Eco', NOW()),
  (2, 'dave_drone', 'hash3', 'dave@skydrones.com', 'operator', 'Dave Drone', NOW()),
  (3, 'sarah_sky', 'hash4', 'sarah@urbanair.io', 'admin', 'Sarah Sky', NOW()),
  (4, 'mike_marine', 'hash5', 'mike@oceanwatch.org', 'viewer', 'Mike Marine', NOW());
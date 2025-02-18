INSERT INTO organizations (organization_name, contact_email, contact_phone, address, website)
VALUES 
  ('GreenEarth Monitoring', 'contact@greenearth.org', '+1234567890', '123 Eco St, Portland, USA', 'https://greenearth.org'),
  ('SkyDrones Inc', 'info@skydrones.com', '+442345678901', '456 Innovation Blvd, London, UK', 'https://skydrones.com'),
  ('UrbanAir Analytics', 'support@urbanair.io', '+61412345678', '789 Skyway, Sydney, Australia', 'https://urbanair.io'),
  ('OceanWatch', 'hello@oceanwatch.org', '+15551234567', '321 Marine Rd, Miami, USA', 'https://oceanwatch.org'),
  ('Alpine Climate Research', 'research@alpineclimate.eu', '+49876543210', '10 Mountain View, Zurich, Switzerland', 'https://alpineclimate.eu');

  INSERT INTO users (organization_id, username, api_key, password_hash, email, role)
VALUES 
  (1, 'john_green', 'abc123', 'hash1', 'john@greenearth.org', 'admin'),
  (1, 'emily_eco', 'def456', 'hash2', 'emily@greenearth.org', 'viewer'),
  (2, 'dave_drone', 'ghi789', 'hash3', 'dave@skydrones.com', 'operator'),
  (3, 'sarah_sky', 'jkl012', 'hash4', 'sarah@urbanair.io', 'admin'),
  (4, 'mike_marine', 'mno345', 'hash5', 'mike@oceanwatch.org', 'viewer');

INSERT INTO locations (latitude, longitude, city, country, region)
VALUES
    (24.5247, 39.5692, 'Medina', 'Saudi Arabia', 'Al Madinah Region'),
    (21.5433, 39.1728, 'Jeddah', 'Saudi Arabia', 'Makkah Region'),
    (21.3891, 39.8579, 'Mecca', 'Saudi Arabia', 'Makkah Region'),
    (26.4207, 50.0888, 'Dammam', 'Saudi Arabia', 'Eastern Province'),
    (21.4267, 40.4833, 'Taif', 'Saudi Arabia', 'Makkah Region'),
    (21.4901, 39.1862, 'Jeddah', 'Saudi Arabia', 'Makkah Region'),
    (24.7136, 46.6753, 'Riyadh', 'Saudi Arabia', 'Riyadh Region');


  INSERT INTO sensors (organization_id, sensor_type, model, deployment_date, default_location_id, vehicle_id, drone_model, station_name, operator_name)
VALUES 
  (1, 'Weather Station', 'WS-3000', '2023-01-15', 1, NULL, NULL, 'Portland HQ Station', 'John Green'),
  (2, 'Drone Sensor', 'DS-AirPro', '2023-03-20', 2, NULL, 'DJI Phantom 4', NULL, 'Dave Drone'),
  (3, 'Air Quality', 'AQM-45', '2023-05-10', 3, 'VAN-789', NULL, 'Sydney Mobile Unit', 'Sarah Sky'),
  (4, 'Marine Sensor', 'MS-DeepBlue', '2023-07-01', 4, NULL, NULL, 'Miami Coastal Station', 'Mike Marine'),
  (5, 'Alpine Climate', 'AC-1000', '2023-09-12', 5, NULL, NULL, 'Zurich Alpine Station', 'Anna Alpine');

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


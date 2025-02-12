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

  INSERT INTO locations (latitude, longitude, altitude, city, region, country)
VALUES 
  (45.5231, -122.6765, 50.5, 'Portland', 'Oregon', 'USA'),
  (51.5074, -0.1278, 35.0, 'London', 'England', 'UK'),
  (-33.8688, 151.2093, 3.0, 'Sydney', 'New South Wales', 'Australia'),
  (25.7617, -80.1918, 2.0, 'Miami', 'Florida', 'USA'),
  (47.3769, 8.5417, 408.0, 'Zurich', 'Zurich', 'Switzerland');


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

  INSERT INTO measurements (sensor_id, measurement_time, location_id, attribute_id, value)
VALUES 
  (1, '2024-01-01 12:00:00', 1, 1, 22.5),
  (1, '2024-01-01 12:00:00', 1, 2, 65.0),
  (2, '2024-01-01 13:15:00', 2, 3, 415.0),
  (3, '2024-01-01 14:30:00', 3, 4, 12.3),
  (4, '2024-01-01 15:45:00', 4, 5, 5.8);

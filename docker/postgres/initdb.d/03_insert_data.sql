-- Insert into organizations
INSERT INTO organizations (organization_name, contact_email, contact_phone, address, website)
VALUES 
('Org1', 'contact@org1.com', '123-456-7890', '123 Main St, City, Country', 'http://www.org1.com'),
('Org2', 'contact@org2.com', '098-765-4321', '456 Elm St, City, Country', 'http://www.org2.com');

-- Insert into users
INSERT INTO users (organization_id, username, api_key, password_hash, email, role)
VALUES 
(1, 'user1', 'api_key_1', 'password_hash_1', 'user1@org1.com', 'admin'),
(2, 'user2', 'api_key_2', 'password_hash_2', 'user2@org2.com', 'user');

-- Insert into locations
INSERT INTO locations (latitude, longitude, altitude, city, region, country)
VALUES 
(40.7128, -74.0060, 10, 'New York', 'NY', 'USA'),
(34.0522, -118.2437, 15, 'Los Angeles', 'CA', 'USA');

-- Insert into sensors
INSERT INTO sensors (organization_id, sensor_type, model, deployment_date, default_location_id, vehicle_id, drone_model, station_name, operator_name, additional_info)
VALUES 
(1, 'temperature', 'model_1', '2025-01-01', 1, 'vehicle_1', 'drone_model_1', 'station_1', 'operator_1', 'additional_info_1'),
(2, 'humidity', 'model_2', '2025-01-02', 2, 'vehicle_2', 'drone_model_2', 'station_2', 'operator_2', 'additional_info_2');

-- Insert into measurement_attributes
INSERT INTO measurement_attributes (attribute_name, unit)
VALUES 
('co2_ppm', 'ppm'),
('temperature_celsius', '°C');

-- Insert into measurements
INSERT INTO measurements (sensor_id, measurement_time, location_id, attribute_id, value)
VALUES 
(1, '2025-01-30 22:25:30', 1, 1, 400.5),
(2, '2025-01-30 22:30:30', 2, 2, 22.5);
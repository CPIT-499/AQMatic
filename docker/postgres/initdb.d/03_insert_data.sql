-- Insert into organizations
INSERT INTO organizations (organization_name, contact_email, contact_phone, address, website)
VALUES 
    ('Org A', 'orga@example.com', '123-456-7890', '123 Main St, City A', 'www.orga.com'),
    ('Org B', 'orgb@example.com', '987-654-3210', '456 Elm St, City B', 'www.orgb.com'),
    ('Org C', 'orgc@example.com', '555-123-4567', '789 Oak St, City C', 'www.orgc.com'),
    ('Org D', 'orgd@example.com', '555-987-6543', '101 Pine St, City D', 'www.orgd.com'),
    ('Org E', 'orge@example.com', '555-654-3210', '202 Maple St, City E', 'www.orge.com'),
    ('Org F', 'orgf@example.com', '555-321-0987', '303 Birch St, City F', 'www.orgf.com'),
    ('Org G', 'orgg@example.com', '555-876-5432', '404 Cedar St, City G', 'www.orgg.com');

-- Insert into users
INSERT INTO users (organization_id, username, api_key, password_hash, email, role)
VALUES
    (1, 'user1', 'api_key_1', 'hash1', 'user1@example.com', 'admin'),
    (2, 'user2', 'api_key_2', 'hash2', 'user2@example.com', 'user');

-- Insert into locations
INSERT INTO locations (latitude, longitude, altitude, city, region, country)
VALUES
    (24.7136, 46.6753, 612.0, 'Riyadh', 'Riyadh Province', 'Saudi Arabia'),
    (21.4858, 39.1925, 12.0, 'Jeddah', 'Makkah Province', 'Saudi Arabia');

-- Insert into sensors
INSERT INTO sensors (organization_id, sensor_type, model, deployment_date, default_location_id, vehicle_id, drone_model, station_name, operator_name, additional_info)
VALUES
    (1, 'Air Quality', 'Model X', '2023-01-01', 1, 'Vehicle 1', 'Drone A', 'Station 1', 'Operator 1', 'Additional info 1'),
    (2, 'Weather', 'Model Y', '2023-02-01', 2, 'Vehicle 2', 'Drone B', 'Station 2', 'Operator 2', 'Additional info 2');

-- Insert into measurements
INSERT INTO measurements (sensor_id, measurement_time, location_id, co2_ppm, no2_ppm, so2_ppm, pm2_5, pm10, o3_ppm, temperature, humidity, wind_speed, wind_direction, additional_params)
VALUES
    (1, '2023-10-01 12:00:00', 1, 400.5, 0.05, 0.02, 10.2, 20.5, 0.03, 25.5, 60.0, 5.5, 120.0, 'Additional params 1'),
    (2, '2023-10-01 13:00:00', 2, 410.0, 0.06, 0.03, 11.0, 21.0, 0.04, 26.0, 62.0, 6.0, 130.0, 'Additional params 2');
-- Create a table to store air quality sensor data
CREATE TABLE sensors (
    sensor_id SERIAL PRIMARY KEY,
    sensor_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    installation_date DATE NOT NULL
);

-- Create a table to store air quality readings
CREATE TABLE air_quality_readings (
    reading_id SERIAL PRIMARY KEY,
    sensor_id INT REFERENCES sensors(sensor_id),
    reading_value DECIMAL(5, 2) NOT NULL,
    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into the sensors table
INSERT INTO sensors (sensor_name, location, installation_date)
VALUES
('CO2 Sensor', 'Riyadh', '2024-01-01'),
('PM2.5 Sensor', 'Jeddah', '2024-02-15');

-- Insert sample data into the air_quality_readings table
INSERT INTO air_quality_readings (sensor_id, reading_value)
VALUES
(1, 400.50),
(2, 35.70);

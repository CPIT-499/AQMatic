-- Table: organizations
DROP TABLE IF EXISTS organizations CASCADE;
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    organization_name VARCHAR NOT NULL,
    contact_email VARCHAR,
    contact_phone VARCHAR,
    address TEXT,
    website VARCHAR
);

-- Table: users
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(organization_id),
    username VARCHAR NOT NULL,
    api_key VARCHAR,
    password_hash TEXT NOT NULL,
    email TEXT,
    role VARCHAR
);

-- Table: locations
DROP TABLE IF EXISTS locations CASCADE;
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    altitude REAL,
    city VARCHAR,
    region VARCHAR,
    country VARCHAR
);

-- Table: sensors
DROP TABLE IF EXISTS sensors CASCADE;
CREATE TABLE sensors (
    sensor_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(organization_id),
    sensor_type VARCHAR NOT NULL,
    model VARCHAR,
    deployment_date DATE,
    default_location_id INTEGER REFERENCES locations(location_id),
    vehicle_id VARCHAR,
    drone_model VARCHAR,
    station_name VARCHAR,
    operator_name VARCHAR,
    additional_info TEXT
);

-- Table: measurements
DROP TABLE IF EXISTS measurements CASCADE;
CREATE TABLE measurements (
    measurement_id SERIAL PRIMARY KEY,
    sensor_id INTEGER NOT NULL REFERENCES sensors(sensor_id),
    measurement_time TIMESTAMP NOT NULL,
    location_id INTEGER NOT NULL REFERENCES locations(location_id),
    co2_ppm REAL,
    no2_ppm REAL,
    so2_ppm REAL,
    pm2_5 REAL,
    pm10 REAL,
    o3_ppm REAL,
    temperature REAL,
    humidity REAL,
    wind_speed REAL,
    wind_direction REAL,
    additional_params TEXT
);

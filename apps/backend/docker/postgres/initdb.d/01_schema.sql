-- Table: organizations
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    organization_name VARCHAR NOT NULL,
    contact_email VARCHAR,
    contact_phone VARCHAR,
    address TEXT,
    website VARCHAR
);

-- Table: users
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

-- Table: attributes
CREATE TABLE measurement_attributes (
    attribute_id SERIAL PRIMARY KEY, -- Unique ID for each attribute
    attribute_name VARCHAR NOT NULL UNIQUE, -- Name of the attribute (e.g., "co2_ppm")
    unit VARCHAR NOT NULL -- Unit of measurement (e.g., "ppm", "°C")
);



-- Table: measurements
CREATE TABLE measurements (
    measurement_id SERIAL PRIMARY KEY,
    sensor_id INTEGER NOT NULL REFERENCES sensors(sensor_id),
    organization_id INTEGER NOT NULL REFERENCES organizations(organization_id),
    measurement_time TIMESTAMP NOT NULL,
    location_id INTEGER NOT NULL REFERENCES locations(location_id),
    attribute_id INTEGER NOT NULL REFERENCES measurement_attributes(attribute_id),
    value NUMERIC NOT NULL
);



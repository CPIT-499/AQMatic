-- Create enum type for organization role
CREATE TYPE organization_role AS ENUM ('public', 'private');
-- Create organizations table with role field
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    organization_name VARCHAR NOT NULL,
    contact_email VARCHAR,
    contact_phone VARCHAR,
    address TEXT,
    website VARCHAR,
    role organization_role NOT NULL DEFAULT 'private'
);

-- Table: users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(organization_id),
    username VARCHAR NOT NULL,
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


-- --- Modifications for next-auth (Credentials/Email Providers) ---

-- Modify existing users table
-- Note: Consider renaming user_id to id if the adapter doesn't map it automatically.
-- Making email UNIQUE and NOT NULL as it's the primary identifier for auth.
ALTER TABLE users
    ADD COLUMN name VARCHAR,
    ADD COLUMN "emailVerified" TIMESTAMPTZ, -- Auth.js uses TIMESTAMPTZ for this
    ALTER COLUMN email SET NOT NULL,
    ADD CONSTRAINT users_email_unique UNIQUE (email);
    -- We are keeping organization_id, username, password_hash, role
    -- OMITTING image column as requested.

-- --- Tables required by next-auth (excluding accounts) ---

-- Table: sessions
-- Stores user sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    "sessionToken" VARCHAR NOT NULL UNIQUE,
    "userId" INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Ensure this references your user primary key correctly
    expires TIMESTAMPTZ NOT NULL
);

-- Table: verification_tokens
-- Stores tokens for email verification or passwordless login
CREATE TABLE verification_tokens (
    identifier VARCHAR NOT NULL,
    token VARCHAR NOT NULL UNIQUE,
    expires TIMESTAMPTZ NOT NULL,
    CONSTRAINT verification_tokens_identifier_token_unique UNIQUE (identifier, token)
);

-- Add index for performance (optional but recommended)
CREATE INDEX sessions_userId_idx ON sessions("userId");



-- Script to prepare database for clean Airflow installation in public schema

-- Make sure admin user has full permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;

-- Remove the alembic_version table which is causing issues
DROP TABLE IF EXISTS public.alembic_version CASCADE;

-- We'll use Airflow with the public schema to match the existing dump
-- This will allow Airflow to reuse existing tables where appropriate

-- Set search path to include public schema
ALTER DATABASE postgres SET search_path TO public;
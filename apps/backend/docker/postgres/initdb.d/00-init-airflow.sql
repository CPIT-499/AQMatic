-- Create a separate schema for Airflow metadata
CREATE SCHEMA IF NOT EXISTS airflow;

-- Set the search path to include both public and airflow schemas
ALTER DATABASE postgres SET search_path TO public, airflow;

-- Create a dedicated user for Airflow if needed
-- CREATE USER airflow WITH PASSWORD 'airflow';
-- GRANT ALL PRIVILEGES ON SCHEMA airflow TO airflow;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA airflow TO airflow;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA airflow TO airflow;

-- Drop any existing Airflow-specific tables from the public schema to avoid conflicts
-- These are the tables we'll let Airflow recreate in its own schema
DO $$
DECLARE
    airflow_tables TEXT[] := ARRAY[
        'ab_permission', 'ab_permission_view', 'ab_permission_view_role', 
        'ab_register_user', 'ab_role', 'ab_user', 'ab_user_role', 
        'ab_view_menu', 'alembic_version', 'callback_request', 
        'connection', 'dag', 'dag_code', 'dag_owner_attributes', 
        'dag_pickle', 'dag_priority_parsing_request', 'dag_run', 
        'dag_run_note', 'dag_schedule_dataset_alias_reference', 
        'dag_schedule_dataset_reference', 'dag_tag', 'dag_warning', 
        'dagrun_dataset_event', 'dataset', 'dataset_alias', 
        'dataset_alias_dataset', 'dataset_alias_dataset_event', 
        'dataset_dag_run_queue', 'dataset_event', 'import_error', 
        'job', 'log', 'log_template', 'rendered_task_instance_fields', 
        'serialized_dag', 'session', 'sla_miss', 'slot_pool', 
        'task_fail', 'task_instance', 'task_instance_history', 
        'task_instance_note', 'task_map', 'task_outlet_dataset_reference', 
        'task_reschedule', 'trigger', 'variable', 'xcom'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY airflow_tables
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || t || ' CASCADE;';
    END LOOP;
END $$;
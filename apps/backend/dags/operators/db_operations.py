import os
import psycopg2

def execute_sql_file(sql_file_path, **kwargs):
    """Execute a SQL file against the PostgreSQL database."""
    # Get database connection parameters from environment variables
    db_params = {
        'host': os.getenv('POSTGRES_HOST', 'db'),
        'database': os.getenv('POSTGRES_DB', 'postgres'),
        'user': os.getenv('POSTGRES_USER', 'admin'),
        'password': os.getenv('POSTGRES_PASSWORD', 'admin_123'),
        'port': os.getenv('POSTGRES_PORT', '5432')
    }
    
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        # Read SQL file content
        with open(sql_file_path, 'r') as f:
            sql = f.read()
        
        # Extract view name from SQL
        if 'VIEW' not in sql or 'AS' not in sql:
            raise ValueError(f"SQL file {sql_file_path} does not contain a valid CREATE VIEW statement.")
        
        view_name = sql.split('VIEW')[1].split('AS')[0].strip()
        
        # First drop the view if it exists
        drop_sql = f"DROP VIEW IF EXISTS {view_name};"
        cursor.execute(drop_sql)
        conn.commit()
        
        # Then execute the create view SQL
        cursor.execute(sql)
        conn.commit()
        print(f"Successfully executed SQL from {sql_file_path}")
    except Exception as e:
        print(f"Error executing SQL: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def create_hourly_summary_view(**kwargs):
    """Task to create the hourly measurement summary view."""
    sql_file_path = '/opt/airflow/src/DBview/hourly_measurement_summary_View_graph.sql'
    execute_sql_file(sql_file_path)

def create_map_data_view(**kwargs):
    """Task to create the map data view."""
    sql_file_path = '/opt/airflow/src/DBview/map_data_view.sql'
    execute_sql_file(sql_file_path)
def create_dashboard_summary_stats_view(**kwargs):
    """Task to create the dashboard summary stats view."""
    sql_file_path = '/opt/airflow/src/DBview/dashboard_summary_stats_view.sql'
    execute_sql_file(sql_file_path)

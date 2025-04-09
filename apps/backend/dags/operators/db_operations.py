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
        
        # Execute SQL
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
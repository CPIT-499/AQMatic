import psycopg2
import os

def connect_to_db():
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            database=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            port=os.getenv("POSTGRES_PORT", 5432)
        )
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None
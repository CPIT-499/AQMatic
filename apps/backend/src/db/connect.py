import psycopg2
import os
from contextlib import contextmanager

def connect_to_db():
    """Get a database connection using environment variables"""
    try:
        return psycopg2.connect(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            database=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            port=os.getenv("POSTGRES_PORT", 5432)
        )
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None

@contextmanager
def db_cursor():
    """Context manager for database operations, handles connection and cursor"""
    conn = connect_to_db()
    if conn is None:
        yield None
    else:
        try:
            cursor = conn.cursor()
            yield cursor
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Database error: {e}")
            yield None
        finally:
            cursor.close()
            conn.close()
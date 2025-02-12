import psycopg2
from psycopg2 import sql
from datetime import datetime

# Database connection parameters
DB_HOST = "0.tcp.in.ngrok.io"  # Replace with your Docker container's IP if not running locally
DB_PORT = 10091
DB_NAME = "projectDB"  # Replace with your database name
DB_USER = "admin"      # Replace with your database user
DB_PASSWORD = "admin@123"  # Replace with your database password

# Connect to the database
def connect_to_db():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        print("Connected to the database!")
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None

# Insert sample data into the tables
def insert_sample_data(conn):
    try:
        cursor = conn.cursor()

        # Insert into organizations
        cursor.execute("""
            INSERT INTO organizations (organization_name, contact_email, contact_phone, address, website)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING organization_id;
        """, ("7yo", "NEW", "+123456789", "123 Green St, EcoCity", "www.ecotech.com"))
        org_id = cursor.fetchone()[0]
        print(f"Inserted organization with ID: {org_id}")



        # Commit the transaction
        conn.commit()
        print("Data inserted successfully!")

    except Exception as e:
        print(f"Error inserting data: {e}")
        conn.rollback()
    finally:
        cursor.close()

# Main function
def main():
    conn = connect_to_db()
    if conn:
        insert_sample_data(conn)
        conn.close()
        print("Database connection closed.")

if __name__ == "__main__":
    main()
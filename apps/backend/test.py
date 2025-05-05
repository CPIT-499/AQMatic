import json
import re
from datetime import datetime
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Define constants
APSCO_ORG_ID = 9  # From your DB screenshot
DATA_FILE = r"c:\IT\Smesters\th7_SMESTER\CPIT-499\AQMatic\Data"

def connect_to_db():
    """Connect to your PostgreSQL database using environment variables"""
    # When running outside Docker, use localhost instead of 'db'
    host = "localhost"  # Use localhost when running script directly on your machine
    
    return psycopg2.connect(
        host=host,
        port=int(os.getenv("POSTGRES_PORT", 5432)),
        database=os.getenv("POSTGRES_DB", "postgres"),
        user=os.getenv("POSTGRES_USER", "admin"),
        password=os.getenv("POSTGRES_PASSWORD", "admin_123")
    )

def main():
    """Insert APSCO sensor data into database"""
    conn = None
    try:
        # Connect to database
        conn = connect_to_db()
        cursor = conn.cursor()
        print("Connected to database successfully!")
        
        # Read data file and insert measurements
        with open(DATA_FILE, 'r') as file:
            lines = file.readlines()
            print(f"Read {len(lines)} lines from data file")
            
            # Get a sensor ID for APSCO or create one
            cursor.execute(
                "SELECT sensor_id FROM sensors WHERE organization_id = %s LIMIT 1",
                (APSCO_ORG_ID,)
            )
            sensor_result = cursor.fetchone()
            if sensor_result:
                sensor_id = sensor_result[0]
            else:
                cursor.execute(
                    "INSERT INTO sensors (organization_id, sensor_type, model, deployment_date) "
                    "VALUES (%s, 'Mobile Sensor', 'AQMatic-Mobile', CURRENT_DATE) RETURNING sensor_id",
                    (APSCO_ORG_ID,)
                )
                sensor_id = cursor.fetchone()[0]
                conn.commit()
            
            # Get attribute IDs
            cursor.execute("SELECT attribute_id, attribute_name FROM measurement_attributes")
            attr_rows = cursor.fetchall()
            attr_map = {name: id for id, name in attr_rows}
            
            # Process each line
            records_inserted = 0
            for line in lines[:20]:  # Process first 20 lines as a test
                # Extract JSON from the line
                json_match = re.search(r'-> (\{.*\})', line)
                if json_match:
                    data = json.loads(json_match.group(1))
                    
                    # Check if location exists or create it
                    cursor.execute(
                        "SELECT location_id FROM locations "
                        "WHERE ABS(latitude - %s) < 0.0001 AND ABS(longitude - %s) < 0.0001",
                        (data["latitude"], data["longitude"])
                    )
                    location_result = cursor.fetchone()
                    if location_result:
                        location_id = location_result[0]
                    else:
                        cursor.execute(
                            "INSERT INTO locations (latitude, longitude, city, region, country) "
                            "VALUES (%s, %s, 'Jeddah', 'Makkah', 'Saudi Arabia') RETURNING location_id",
                            (data["latitude"], data["longitude"])
                        )
                        location_id = cursor.fetchone()[0]
                        conn.commit()
                    
                    # Convert relative timestamp to absolute datetime (using current time as base)
                    measurement_time = datetime.now()
                    
                    # Insert measurements
                    field_mapping = {
                        "temperature": "temperature",
                        "humidity": "humidity",
                        "aqi": "air_quality_index",
                        "tvoc": "tvoc_ppb",
                        "eco2": "co2"
                    }
                    
                    for field, db_field in field_mapping.items():
                        if field in data and db_field in attr_map:
                            cursor.execute(
                                "INSERT INTO measurements "
                                "(sensor_id, organization_id, measurement_time, location_id, attribute_id, value) "
                                "VALUES (%s, %s, %s, %s, %s, %s)",
                                (sensor_id, APSCO_ORG_ID, measurement_time, location_id, 
                                 attr_map[db_field], float(data[field]))
                            )
                            records_inserted += 1
            
            conn.commit()
            print(f"Successfully inserted {records_inserted} measurements")
    
    except Exception as e:
        print(f"Error: {str(e)}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()
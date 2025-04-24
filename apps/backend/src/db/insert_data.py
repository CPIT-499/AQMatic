from src.db.map import get_attribute_id
from src.db.connect import db_cursor

def insert_measurements(conn, sensor_id, organization_id, measurement_time, location_id, attributes):
    """
    Inserts measurements into the database.
    Looks up each attribute's id from the current database.
    """
    attribute_id = "attribute_id" # attribute_id column name
    attribute_name = "attribute_name" # attribute_name column name
    measurement_attributes = "measurement_attributes" # table name
    attribute_id_map = get_attribute_id(conn, attribute_id, attribute_name , measurement_attributes)
    cursor = conn.cursor()
    for attr, value in attributes.items():
        attribute_id = attribute_id_map.get(attr)
        if attribute_id:
            cursor.execute(
                "INSERT INTO measurements (sensor_id, organization_id, measurement_time, location_id, attribute_id, value) VALUES (%s, %s, %s, %s, %s, %s)",
                (sensor_id, organization_id, measurement_time, location_id, attribute_id, value)
            )
        else:
            print(f"Attribute '{attr}' not found in database.")
    conn.commit()

    
# this method only going to use it if the insert was coming from the user on the website however we are not going to use it we are going to insert it manually in the database
# def insert_location(conn, latitude, longitude, altitude=None, city=None, region=None, country=None):
#     """
#     Inserts a new location into the locations table.
#     """
#
#     cursor = conn.cursor()
#     cursor.execute(
#         "INSERT INTO locations (latitude, longitude, altitude, city, region, country) VALUES (?, ?, ?, ?, ?, ?)",
#         (latitude, longitude, altitude, city, region, country)
#     )
#     conn.commit()
#     return cursor.lastrowid

def insert_organization(conn, organization_name, contact_email=None, contact_phone=None, address=None, website=None, role='Private'):
    """
    Inserts a new organization into the organizations table.
    """
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO organizations (organization_name, contact_email, contact_phone, address, website, role) VALUES (?, ?, ?, ?, ?, ?)",
        (organization_name, contact_email, contact_phone, address, website, role)
    )
    conn.commit()
    return cursor.lastrowid

def insert_user(conn, organization_id, username, password_hash, api_key=None, email=None, role=None):
    """
    Inserts a new user into the users table.
    """
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (organization_id, username, api_key, password_hash, email, role) VALUES (?, ?, ?, ?, ?, ?)",
        (organization_id, username, api_key, password_hash, email, role)
    )
    conn.commit()
    return cursor.lastrowid



def insert_sensor(conn, organization_id, sensor_type, model=None, deployment_date=None, default_location_id=None,
                  vehicle_id=None, drone_model=None, station_name=None, operator_name=None, additional_info=None):
    """
    Inserts a new sensor into the sensors table.
    """
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO sensors 
           (organization_id, sensor_type, model, deployment_date, default_location_id, vehicle_id, drone_model, station_name, operator_name, additional_info)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (organization_id, sensor_type, model, deployment_date, default_location_id, vehicle_id, drone_model, station_name, operator_name, additional_info)
    )
    conn.commit()
    return cursor.lastrowid

def insert_measurement_attribute(conn, attribute_name, unit):
    """
    Inserts a new measurement attribute into the measurement_attributes table.
    """
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO measurement_attributes (attribute_name, unit) VALUES (?, ?)",
        (attribute_name, unit)
    )
    conn.commit()
    return cursor.lastrowid

def insert_forecasts(forecast_rows):
    """
    Insert or update forecast values in the database.
    
    Args:
        forecast_rows: List of tuples containing forecast data
                      (org_id, attr_id, horizon_days, forecast_time, target_time, predicted_value)
                      
    Returns:
        True if successful, False otherwise
    """
    with db_cursor() as cursor:
        if cursor is None:
            return False
        
        cursor.executemany("""
            INSERT INTO forecasts
              (organization_id, attribute_id, horizon_days,
              forecast_time, target_time, predicted_value)
            VALUES (%s,%s,%s,%s,%s,%s)
            ON CONFLICT (organization_id, attribute_id, horizon_days, target_time)
            DO UPDATE SET 
              forecast_time = EXCLUDED.forecast_time,
              predicted_value = EXCLUDED.predicted_value
        """, forecast_rows)
        return True
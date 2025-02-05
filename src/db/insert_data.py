import sqlite3

def get_attribute_id_map(conn):
    """
    Selects all attributes from measurement_attributes and returns a dictionary mapping
    attribute_name to id.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT id, attribute_name FROM measurement_attributes;")
    rows = cursor.fetchall()
    # Build mapping: key=attribute_name, value=id
    return {name: id_ for id_, name in rows}

def insert_measurements(conn, sensor_id, measurement_time, location_id, attributes):
    """
    Inserts measurements into the database.
    Looks up each attribute's id from the current database.
    """
    attribute_id_map = get_attribute_id_map(conn)
    cursor = conn.cursor()
    for attr, value in attributes.items():
        attribute_id = attribute_id_map.get(attr)
        if attribute_id:
            cursor.execute(
                "INSERT INTO measurements (sensor_id, measurement_time, location_id, attribute_id, value) VALUES (?, ?, ?, ?, ?)",
                (sensor_id, measurement_time, location_id, attribute_id, value)
            )
        else:
            print(f"Attribute '{attr}' not found in database.")
    conn.commit()
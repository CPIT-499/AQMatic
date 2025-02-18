
# Mapping ==========================================
def get_attribute_id(conn, id_column, name_column, table_name):
        """
        Selects all attributes from the specified table and returns a dictionary mapping
        name_column to id_column.
        """
        cursor = conn.cursor()
        cursor.execute(f"SELECT {id_column}, {name_column} FROM {table_name};")
        rows = cursor.fetchall()
        # Build mapping: key=name_column, value=id_column
        return {name: id_ for id_, name in rows}
# =================================================

# Mapping ==========================================
def get_location_id(conn, id_column, latitude, longitude, locations):
    """
    Selects the id from the specified table based on latitude and longitude.
    Returns the location_id or raises an exception if not found.
    """
    cursor = conn.cursor()
    cursor.execute(
        f"SELECT location_id FROM {locations} WHERE latitude = %s AND longitude = %s;",
        (latitude, longitude)
    )
    result = cursor.fetchone()
    if result is None:
        raise ValueError(f"No location found for coordinates: {latitude}, {longitude}")
    return result[0]
# =================================================
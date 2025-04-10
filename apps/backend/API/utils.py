from datetime import datetime

def format_hourly_measurement_data(data):
    formatted_data = []
    
    # Group measurements by time to consolidate readings from the same timestamp
    time_grouped_data = {}
    
    for row in data:
        # Extract relevant data from the database row
        measurement_time = row.measurement_time
        attribute_name = row.attribute_name
        value = row.value
        
        if value is None:
            continue  # Skip null values
            
        time_key = measurement_time.strftime("%b %d") if measurement_time else None
        if not time_key:
            continue  # Skip entries with invalid time
            
        # Initialize the dictionary for this timestamp if not exists
        if time_key not in time_grouped_data:
            time_grouped_data[time_key] = {"date": time_key}
            
        # Only add non-null values
        if value is not None:
            try:
                # Convert to float if possible
                float_value = float(value)
                time_grouped_data[time_key][attribute_name] = f"{float_value:.2f}"
            except (ValueError, TypeError):
                # If conversion fails, use the original value
                time_grouped_data[time_key][attribute_name] = value
    
    # Convert dictionary to list
    formatted_data = list(time_grouped_data.values())
    return formatted_data
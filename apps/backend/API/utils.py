from datetime import datetime

def format_hourly_measurement_data(data):
    formatted_data = []
    

    # Data is list

    # Group measurements by time to consolidate readings from the same timestamp
    time_grouped_data = {}
    
    for row in data:
        # Extract relevant data from the database row
        measurement_time = row.measurement_time
        attribute_name = row.attribute_name
        value = row.value
        
        if value is None or value == 0:
            continue  # Skip null values
            
        time_key = measurement_time.strftime("%b %d") if measurement_time else None
        # Time key: something like -> Apr 09
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


def format_map_data(rows):
    """
    Format map data for visualization, excluding fields with zero values.
    """
    formatted_data = []

    for row in rows:
        data = {
            "location_id": row.location_id,
            "latitude": float(row.latitude or 0.0),
            "longitude": float(row.longitude or 0.0),
            "city": row.city or "",
            "region": row.region or "",
            "country": row.country or "",
            "organization_id": row.organization_id,
        }

        # Add only non-zero values
        gas_fields = {
            "pm25": float(row.pm25 or 0.0),
            "pm10": float(row.pm10 or 0.0),
            "o3": float(row.o3 or 0.0),
            "no2": float(row.no2 or 0.0),
            "so2": float(row.so2 or 0.0),
            "co": float(row.co or 0.0),
            "temperature": float(row.temperature or 0.0),
            "humidity": float(row.humidity or 0.0),
            "wind_speed": float(row.wind_speed or 0.0),
            "co2": float(row.co2 or 0.0),
            "methane": float(row.methane or 0.0),
            "nitrous_oxide": float(row.nitrous_oxide or 0.0),
            "fluorinated_gases": float(row.fluorinated_gases or 0.0),
            "intensity": float(row.intensity or 0.0),
        }

        # Include only fields with non-zero values
        for key, value in gas_fields.items():
            if value != 0.0:
                data[key] = value

        formatted_data.append(data)

    return formatted_data




def format_forecast_date(date_string):
    """
    Convert date string from 'YYYY-MM-DD' format to 'Month DD' format.
    
    Args:
        date_string: String date in format '2025-05-02'
        
    Returns:
        String date in format 'May 02'
        
    Example:
        '2025-05-02' -> 'May 02'
    """
    try:
        # Parse the input date string
        date_obj = datetime.strptime(date_string, '%Y-%m-%d')
        
        # Format to 'Month DD' format
        # %b gives abbreviated month name, %d gives zero-padded day
        formatted_date = date_obj.strftime('%b %d')
        
        # To get full month name instead of abbreviated, use:
        formatted_date = date_obj.strftime('%B %d')
        
        # Remove leading zero from day number if present
        if formatted_date[formatted_date.rfind(' ')+1] == '0':
            formatted_date = formatted_date[:formatted_date.rfind(' ')+1] + formatted_date[formatted_date.rfind(' ')+2:]
            
        return formatted_date
    except Exception as e:
        print(f"Error formatting date '{date_string}': {str(e)}")
        return date_string  # Return original string if there's an error

def format_forecast_data(data):
    formatted_data = []
    
    # Group forecasts by time to consolidate readings from the same timestamp
    time_grouped_data = {}
    
    for row in data:
        # Extract relevant data from the database row
        target_time = row.target_time
        attribute_name = row.attribute_name
        value = row.value
        
        if value is None:
            continue  # Skip null values
        
        # Handle timestamp format "2025-05-02 00:00:00+00:00"
        if isinstance(target_time, str):
            # Extract just the date part and format it
            date_str = target_time.split()[0]  # Get "2025-05-02" from the timestamp
            time_key = format_forecast_date(date_str)
        else:
            # If it's already a datetime object
            time_key = target_time.strftime("%B %d")
            # Remove leading zero from day number if present
            if time_key[time_key.rfind(' ')+1] == '0':
                time_key = time_key[:time_key.rfind(' ')+1] + time_key[time_key.rfind(' ')+2:]
        
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




# ==================================== this is the AQI calculation part ====================================
# source: https://github.com/HardjunoIndracahya/aqi-calculator
AQI_BREAKPOINTS = {
    "pm2.5": [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 350.4, 301, 400),
        (350.5, 500.4, 401, 500),
    ],
    "pm10": [
        (0, 54, 0, 50),
        (55, 154, 51, 100),
        (155, 254, 101, 150),
        (255, 354, 151, 200),
        (355, 424, 201, 300),
        (425, 504, 301, 400),
        (505, 604, 401, 500),
    ],
    "o3": [  # 8-hour average
        (0.000, 0.054, 0, 50),
        (0.055, 0.070, 51, 100),
        (0.071, 0.085, 101, 150),
        (0.086, 0.105, 151, 200),
        (0.106, 0.200, 201, 300),
    ],
    "no2": [
        (0, 53, 0, 50),
        (54, 100, 51, 100),
        (101, 360, 101, 150),
        (361, 649, 151, 200),
        (650, 1249, 201, 300),
        (1250, 1649, 301, 400),
        (1650, 2049, 401, 500),
    ],
    "so2": [
        (0, 35, 0, 50),
        (36, 75, 51, 100),
        (76, 185, 101, 150),
        (186, 304, 151, 200),
        (305, 604, 201, 300),
        (605, 804, 301, 400),
        (805, 1004, 401, 500),
    ],
    "co": [
        (0.0, 4.4, 0, 50),
        (4.5, 9.4, 51, 100),
        (9.5, 12.4, 101, 150),
        (12.5, 15.4, 151, 200),
        (15.5, 30.4, 201, 300),
        (30.5, 40.4, 301, 400),
        (40.5, 50.4, 401, 500),
    ]
}

def calculate_aqi(concentration, breakpoints):
    """Calculate AQI for a given concentration and pollutant breakpoints."""
    # Ensure concentration is a float for calculations
    try:
        concentration = float(concentration)
    except (ValueError, TypeError):
        return None # Cannot calculate if concentration is not a valid number

    for (Clow, Chigh, Ilow, Ihigh) in breakpoints:
        if Clow <= concentration <= Chigh:
            # Standard AQI calculation formula
            # Ensure all parts of the calculation use floats
            try:
                return round(((Ihigh - Ilow) / (Chigh - Clow)) * (concentration - Clow) + Ilow)
            except ZeroDivisionError:
                # Handle cases where Clow == Chigh, though unlikely with standard breakpoints
                return float(Ilow) if concentration == float(Clow) else None
            except Exception:
                # Catch any other calculation errors
                return None
    return None # Concentration out of range

def measure_aqi(pollutant_data):
    """Calculate the overall AQI based on multiple pollutant concentrations."""
    aqi_results = {}
    max_aqi = 0

    for pollutant, value in pollutant_data.items():
        if value is not None and pollutant in AQI_BREAKPOINTS:
            bps = AQI_BREAKPOINTS[pollutant]
            # Value is converted to float inside calculate_aqi now
            individual_aqi = calculate_aqi(value, bps)
            if individual_aqi is not None:
                aqi_results[pollutant] = individual_aqi
                if individual_aqi > max_aqi:
                    max_aqi = individual_aqi
            else:
                aqi_results[pollutant] = None # Indicate calculation failed or out of range
        else:
             aqi_results[pollutant] = None # Pollutant not supported or value is None

    aqi_results["AQI"] = max_aqi if max_aqi > 0 else None # Return None if no valid AQI calculated
    return aqi_results
# ==================================== this is the AQI calculation part ====================================




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

def measure_aqi(data):
    """
    Calculate AQI for a day's average values of various pollutants using US EPA standards.
    
    Parameters:
        data: dict like {
            "pm2.5": 42.3,
            "pm10": 87.1,
            "o3": 0.065,  # in ppm
            "no2": 80,    # in ppb
            "so2": 50,    # in ppb
            "co": 7.0     # in ppm
        }
    
    Returns:
        dict with AQI per pollutant and the max AQI (overall AQI)
    """
    # Breakpoint tables (EPA standard)
    BREAKPOINTS = {
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
        for Clow, Chigh, Ilow, Ihigh in breakpoints:
            if Clow <= concentration <= Chigh:
                return round(((Ihigh - Ilow) / (Chigh - Clow)) * (concentration - Clow) + Ilow)
        return None
    
    aqi_results = {}
    for pollutant, value in data.items():
        bps = BREAKPOINTS.get(pollutant.lower())
        if bps and value is not None:
            aqi_results[pollutant] = calculate_aqi(value, bps)
    
    # Calculate overall AQI (maximum of all pollutant AQIs)
    aqi_results["AQI"] = max([v for v in aqi_results.values() if v is not None], default=None)
    return aqi_results

def get_aqi_category(aqi):
    """
    Get AQI category and color based on AQI value.
    
    Parameters:
        aqi: Air Quality Index value
        
    Returns:
        dict with category name and color information
    """
    if aqi <= 50:
        return {
            "category": "Good",
            "color": {"bg": "bg-green-100", "text": "text-green-800", "border": "border-green-200"}
        }
    elif aqi <= 100:
        return {
            "category": "Moderate",
            "color": {"bg": "bg-yellow-100", "text": "text-yellow-800", "border": "border-yellow-200"}
        }
    elif aqi <= 150:
        return {
            "category": "Unhealthy for Sensitive Groups",
            "color": {"bg": "bg-orange-100", "text": "text-orange-800", "border": "border-orange-200"}
        }
    elif aqi <= 200:
        return {
            "category": "Unhealthy", 
            "color": {"bg": "bg-red-100", "text": "text-red-800", "border": "border-red-200"}
        }
    elif aqi <= 300:
        return {
            "category": "Very Unhealthy",
            "color": {"bg": "bg-purple-100", "text": "text-purple-800", "border": "border-purple-200"}
        }
    else:
        return {
            "category": "Hazardous",
            "color": {"bg": "bg-red-100", "text": "text-red-800", "border": "border-red-200"}
        }

def get_pm25_category(pm25):
    """
    Get PM2.5 category and color based on concentration value.
    
    Parameters:
        pm25: PM2.5 concentration in μg/m³
        
    Returns:
        dict with category name and color information
    """
    if pm25 <= 12:
        return {
            "category": "Good",
            "color": {"bg": "bg-green-100", "text": "text-green-800", "border": "border-green-200"}
        }
    elif pm25 <= 35.4:
        return {
            "category": "Moderate",
            "color": {"bg": "bg-yellow-100", "text": "text-yellow-800", "border": "border-yellow-200"}
        }
    elif pm25 <= 55.4:
        return {
            "category": "Unhealthy for Sensitive Groups",
            "color": {"bg": "bg-orange-100", "text": "text-orange-800", "border": "border-orange-200"}
        }
    elif pm25 <= 150.4:
        return {
            "category": "Unhealthy",
            "color": {"bg": "bg-red-100", "text": "text-red-800", "border": "border-red-200"}
        }
    elif pm25 <= 250.4:
        return {
            "category": "Very Unhealthy",
            "color": {"bg": "bg-purple-100", "text": "text-purple-800", "border": "border-purple-200"}
        }
    else:
        return {
            "category": "Hazardous",
            "color": {"bg": "bg-red-100", "text": "text-red-800", "border": "border-red-200"}
        }

def calculate_percent_change(current, previous):
    """
    Calculate percent change between two values.
    
    Parameters:
        current: Current value
        previous: Previous value
        
    Returns:
        Percent change as a float, or 0 if previous value is 0
    """
    if previous is None or current is None:
        return 0
    
    if previous == 0:
        return 0 if current == 0 else 100  # Handle division by zero
    
    return ((current - previous) / previous) * 100

def process_dashboard_stats(raw_data):
    """
    Process raw measurement data from dashboard_summary_stats_view into formatted stats.
    
    Parameters:
        raw_data: Raw data from the SQL view with current and yesterday measurements
        
    Returns:
        Processed dashboard statistics with AQI calculations and trends
    """
    # Initialize response dictionary
    result = {}
    
    for row in raw_data:
        # Create pollutant data dictionary for AQI calculation
        pollutant_data = {
            "pm2.5": row.pm25_current,
            "pm10": row.pm10_current,
            "o3": row.o3_current,
            "no2": row.no2_current,
            "so2": row.so2_current,
            "co": row.co_current
        }
        
        # Calculate AQI using existing measure_aqi function
        aqi_result = measure_aqi(pollutant_data)
        current_aqi = aqi_result.get("AQI", 0) or 0
        
        # Calculate yesterday's AQI for trend
        yesterday_data = {
            "pm2.5": row.pm25_yesterday,
            "pm10": row.pm10_yesterday,
            "o3": row.o3_yesterday,
            "no2": row.no2_yesterday,
            "so2": row.so2_yesterday,
            "co": row.co_yesterday
        }
        yesterday_aqi = measure_aqi(yesterday_data).get("AQI", 0) or 0
        
        # Calculate trends
        aqi_trend_pct = calculate_percent_change(current_aqi, yesterday_aqi)
        pm25_trend_pct = calculate_percent_change(row.pm25_current, row.pm25_yesterday)
        
        # Get category information
        aqi_category = get_aqi_category(current_aqi)
        pm25_category = get_pm25_category(row.pm25_current or 0)
        
        # Build the response object
        org_id = row.organization_id
        result[org_id] = {
            "role": row.role,
            "current_aqi": {
                "value": current_aqi,
                "category": aqi_category["category"],
                "color": aqi_category["color"],
                "trend": {
                    "value": f"{'+' if aqi_trend_pct > 0 else ''}{aqi_trend_pct:.1f}%",
                    "label": "from yesterday"
                }
            },
            "pm25_level": {
                "value": round(row.pm25_current, 1) if row.pm25_current else 0,
                "category": pm25_category["category"],
                "color": pm25_category["color"],
                "trend": {
                    "value": f"{'+' if pm25_trend_pct > 0 else ''}{pm25_trend_pct:.1f}%",
                    "label": "from yesterday"
                }
            },
            "monitoring_stations": {
                "value": row.monitoring_stations,
                "category": "All Online" if row.monitoring_stations > 0 else "Offline",
                "color": {"bg": "bg-green-100", "text": "text-green-800", "border": "border-green-200"},
                "trend": {
                    "value": "100%",
                    "label": "uptime"
                }
            },
            "alerts_today": {
                "value": row.alerts_today,
                "category": "Attention Needed" if row.alerts_today > 0 else "No Alerts",
                "color": {"bg": "bg-red-100", "text": "text-red-800", "border": "border-red-200"} if row.alerts_today > 0 else {"bg": "bg-green-100", "text": "text-green-800", "border": "border-green-200"},
                "trend": {
                    "value": "",
                    "label": "View details"
                }
            }
        }
    
    return result
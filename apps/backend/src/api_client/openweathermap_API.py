import pandas as pd
import requests
from datetime import datetime
from src.db.connect import connect_to_db
from src.db.insert_data import insert_measurements
from src.db.map import get_location_id

# Saudi Cities Configuration with coordinates
SAUDI_CITIES = {
    "Riyadh": {"lat": 24.7136, "lon": 46.6753},
    "Jeddah": {"lat": 21.5433, "lon": 39.1728},
    "Mecca": {"lat": 21.3891, "lon": 39.8579},
    "Medina": {"lat": 24.5247, "lon": 39.5692},
    "Dammam": {"lat": 26.4207, "lon": 50.0888},
    "Taif": {"lat": 21.4267, "lon": 40.4833}
}

API_KEY = "f63b209dc710559a30df1d507a4f4432"  # Replace with your OpenWeatherMap API key

def get_city_measurements(city, coords):
    """Collect measurements for a single city from APIs"""
    # Fetch weather data
    weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={coords['lat']}&lon={coords['lon']}&appid={API_KEY}"
    weather_response = requests.get(weather_url)
    weather_response.raise_for_status()
    weather_data = weather_response.json()
    
    # Convert temperature from Kelvin to Celsius
    temperature = weather_data["main"]["temp"] - 273.15
    humidity = float(weather_data["main"]["humidity"])
    wind_speed = float(weather_data["wind"]["speed"])
    
    # Fetch air pollution data
    air_url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={coords['lat']}&lon={coords['lon']}&appid={API_KEY}"
    air_response = requests.get(air_url)
    air_response.raise_for_status()
    air_data = air_response.json()
    components = air_data['list'][0]['components']
    
    # Prepare measurements dictionary
    return {
        "city": city,
        "lat": coords["lat"],
        "lon": coords["lon"],
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "co": float(components.get("co", 0)),
        "no2": float(components.get("no2", 0)),
        "o3": float(components.get("o3", 0)),
        "so2": float(components.get("so2", 0)),
        "pm2_5": float(components.get("pm2_5", 0)),
        "pm10": float(components.get("pm10", 0)),
        "co2": 0.0,  # Default values for unavailable metrics
        "methane": 0.0,
        "nitrous_oxide": 0.0,
        "fluorinated_gases": 0.0,
        "timestamp": datetime.fromtimestamp(weather_data["dt"]).strftime("%Y-%m-%d %H:%M:%S")
    }

def collect_measurements():
    """Collect measurements for all cities and return a list of dictionaries"""
    measurements = []
    
    for city, coords in SAUDI_CITIES.items():
        try:
            city_data = get_city_measurements(city, coords)
            measurements.append(city_data)
            print(f"Successfully collected data for {city}")
        except Exception as e:
            print(f"Error collecting data for {city}: {e}")
            
    return measurements

def insert_measurements_openweathermap(**context):
    """
    Insert collected OpenWeatherMap measurements into the database,
    following the working approach from insert_measurements_meto.
    """
    conn = None  # Initialize connection variable
    try:
        ti = context['task_instance']
        data = ti.xcom_pull(task_ids='openweather_operations.collect_openweather_data')
        if not data:
            raise ValueError("No data received from collection task")
        
        # Convert to list if it's a single record
        records = data if isinstance(data, list) else [data]
        
        conn = connect_to_db()
        if not conn:
            raise ConnectionError("Failed to connect to database")
        
        # IMPORTANT: Use get_or_create_organization instead of get_organization_id
        organization_id = get_or_create_organization(conn, "OpenWeatherMap", "https://openweathermap.org")
        
        for record in records:
            location_id = get_location_id(conn, "location_id", record['lat'], record['lon'], "locations")
            insert_measurements(
                conn,
                sensor_id=2,
                measurement_time=record['timestamp'],
                location_id=location_id,
                organization_id=organization_id,
                attributes={
                    "temperature": float(record['temperature']),
                    "humidity": float(record['humidity']),
                    "wind_speed": float(record['wind_speed']),
                    "co": float(record['co']),
                    "no2": float(record['no2']),
                    "o3": float(record['o3']),
                    "so2": float(record['so2']),
                    "pm2.5": float(record['pm2_5']),
                    "pm10": float(record['pm10']),
                    "co2": float(record['co2']),
                    "methane": float(record['methane']),
                    "nitrous_oxide": float(record['nitrous_oxide']),
                    "fluorinated_gases": float(record['fluorinated_gases'])
                }
            )
            print(f"Inserted data for {record.get('city', '')}")
        
        conn.commit()
        return "Successfully inserted measurement into database"
        
    except Exception as e:
        print(f"Error inserting measurements: {str(e)}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

def get_or_create_organization(conn, org_name, website, role='public'):
    """Get organization ID or create a new organization if it doesn't exist"""
    cursor = conn.cursor()
    cursor.execute(
        "SELECT organization_id FROM organizations WHERE organization_name = %s",
        (org_name,)
    )
    org_result = cursor.fetchone()
    
    if not org_result:
        print(f"Creating {org_name} organization record")
        cursor.execute(
            "INSERT INTO organizations (organization_name, contact_email, contact_phone, address, website, role) " +
            "VALUES (%s, %s, %s, %s, %s, %s) RETURNING organization_id",
            (org_name, "Null", "Null", "Null", website, role)
        )
        organization_id = cursor.fetchone()[0]
        conn.commit()
    else:
        organization_id = org_result[0]
    
    return organization_id

if __name__ == "__main__":
    measurements_df = collect_measurements()
    
    if not measurements_df.empty:
        # Convert column names to match database expectations
        measurements_df.rename(columns={'pm2_5': 'pm2.5'}, inplace=True)
    else:
        print("No measurements collected to insert")
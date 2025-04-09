import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry
from datetime import datetime
from src.db.connect import connect_to_db
from src.db.insert_data import insert_measurements
from src.db.map import get_location_id
from src.db.map import get_organization_id


# Initialize API client
session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(session, retries=5, backoff_factor=0.2)
client = openmeteo_requests.Client(session=retry_session)

def get_weather_and_air_quality(**context):
    """
    Fetch and process weather and air quality data
    Returns JSON serializable dictionary
    """
    # Weather API parameters
    weather_params = {
        "latitude": 21.4901,
        "longitude": 39.1862,
        "hourly": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
        "forecast_days": 1
    }
    
    # Air Quality API parameters
    air_quality_params = {
        "latitude": 21.4901,
        "longitude": 39.1862,
        "hourly": ["pm2_5", "carbon_monoxide"],
        "forecast_days": 1
    }
    
    # Fetch data from both APIs
    weather = client.weather_api("https://api.open-meteo.com/v1/forecast", params=weather_params)[0]
    air_quality = client.weather_api("https://air-quality-api.open-meteo.com/v1/air-quality", params=air_quality_params)[0]
    
    # Convert to pandas DataFrames
    weather_df = pd.DataFrame({
        'timestamp': pd.to_datetime(weather.Hourly().Time(), unit='s'),
        'temperature': weather.Hourly().Variables(0).ValuesAsNumpy(),
        'humidity': weather.Hourly().Variables(1).ValuesAsNumpy(),
        'wind_speed': weather.Hourly().Variables(2).ValuesAsNumpy()
    })
    
    air_quality_df = pd.DataFrame({
        'timestamp': pd.to_datetime(air_quality.Hourly().Time(), unit='s'),
        'pm2_5': air_quality.Hourly().Variables(0).ValuesAsNumpy(),
        'co': air_quality.Hourly().Variables(1).ValuesAsNumpy()
    })
    
    # Merge the dataframes
    combined_df = pd.merge(weather_df, air_quality_df, on='timestamp')
    
    # Get the latest reading and convert to JSON serializable format
    latest_data = combined_df.iloc[-1]
    
    return {
        "latitude": 21.4901,
        "longitude": 39.1862,
        'timestamp': latest_data.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        'temperature': float(latest_data.temperature),
        'humidity': float(latest_data.humidity),
        'wind_speed': float(latest_data.wind_speed),
        'pm2_5': float(latest_data.pm2_5),
        'co': float(latest_data.co)
    }

def insert_measurements_meto(**context):
    """
    Save data from XCom to database
    """
    try:
        ti = context['task_instance']
        data = ti.xcom_pull(task_ids='meteo_operations.collect_meteo_data')
        
        if not data:
            raise ValueError("No data received from collection task")
        
    
        conn = connect_to_db()
        latitude = data['latitude']
        longitude = data['longitude']
        location_id = "location_id"
        location_id = get_location_id(conn, location_id, latitude, longitude, "locations")
        # Get organization ID for OpenWeatherMap
        organization_id = get_or_create_organization(conn, "Open-Meteo", "https://openweathermap.org")
        if not conn:
            raise ConnectionError("Failed to connect to database")
            
        insert_measurements(
            conn,
            sensor_id=1,
            measurement_time=data['timestamp'],
            location_id=location_id,
            organization_id=organization_id,
            attributes={
                "temperature": float(data['temperature']),
                "humidity": float(data['humidity']),
                "wind_speed": float(data['wind_speed']),
                "pm2.5": float(data['pm2_5']),
                "co2": float(data['co'])
            }
        )
        
        return "Successfully inserted measurement into database"
        
    except Exception as e:
        print(f"Error saving to database: {str(e)}")
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
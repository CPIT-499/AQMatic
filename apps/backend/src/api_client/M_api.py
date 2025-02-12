import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry
from datetime import datetime
from src.db.connect import connect_to_db
from src.db.insert_data import insert_measurements

# Initialize shared session for both APIs
session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(session, retries=5, backoff_factor=0.2)
client = openmeteo_requests.Client(session=retry_session)

def safe_get(value, idx):
    """
    Returns value[idx] if value is subscriptable, otherwise returns value.
    """
    try:
        return value[idx]
    except TypeError:
        return value
    except Exception:
        return value

def fetch_weather_data():
    params = {
        "latitude": 21.4901,
        "longitude": 39.1862,
        "hourly": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
        "forecast_days": 1
    }
    return client.weather_api("https://api.open-meteo.com/v1/forecast", params=params)[0]

def fetch_air_quality_data():
    params = {
        "latitude": 21.4901,
        "longitude": 39.1862,
        "hourly": ["pm2_5", "carbon_monoxide"],
        "forecast_days": 1
    }
    return client.weather_api("https://air-quality-api.open-meteo.com/v1/air-quality", params=params)[0]

def merge_latest_data(weather_response, air_quality_response):
    # Extract latest weather data
    weather_hourly = weather_response.Hourly()
    weather_time = pd.to_datetime(safe_get(weather_hourly.Time(), -1), unit="s", utc=True)
    temperature = safe_get(weather_hourly.Variables(0).ValuesAsNumpy(), -1)
    humidity = safe_get(weather_hourly.Variables(1).ValuesAsNumpy(), -1)
    wind_speed = safe_get(weather_hourly.Variables(2).ValuesAsNumpy(), -1)
    
    # Extract latest air quality data
    aq_hourly = air_quality_response.Hourly()
    aq_time = pd.to_datetime(safe_get(aq_hourly.Time(), -1), unit="s", utc=True)
    pm2_5 = safe_get(aq_hourly.Variables(0).ValuesAsNumpy(), -1)
    carbon_dioxide = safe_get(aq_hourly.Variables(1).ValuesAsNumpy(), -1)  # Actually CO (carbon monoxide)
    
    # Verify timestamps match (within 1 hour)
    if abs((weather_time - aq_time).total_seconds()) > 3600:
        print(f"Warning: Time mismatch - Weather: {weather_time} vs AQ: {aq_time}")
    
    return {
        "date": weather_time,
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "pm2_5": pm2_5,
        "carbon_dioxide": carbon_dioxide
    }

def run_test():
    try:
        # Fetch from both APIs
        weather = fetch_weather_data()
        air_quality = fetch_air_quality_data()
        
        # Merge latest readings
        combined_data = merge_latest_data(weather, air_quality)
        
        print(f"Combined measurement at {combined_data['date']}:")
        print(f"Temp: {combined_data['temperature']}°C | Humidity: {combined_data['humidity']}%")
        print(f"Wind: {combined_data['wind_speed']} m/s | PM2.5: {combined_data['pm2_5']} µg/m³")
        print(f"CO: {combined_data['carbon_dioxide']} µg/m³")  # Note: This is actually carbon monoxide

        # Insert single combined row, converting numpy types to native float
        conn = connect_to_db()
        if conn:
            insert_measurements(
                conn,
                sensor_id=1,
                measurement_time=combined_data['date'].strftime('%Y-%m-%d %H:%M:%S'),
                location_id=1,
                attributes={
                    "temperature": float(combined_data['temperature']),
                    "humidity": float(combined_data['humidity']),
                    "wind_speed": float(combined_data['wind_speed']),
                    "pm2.5": float(combined_data['pm2_5']),
                    "co2": float(combined_data['carbon_dioxide'])
                }
            )
            conn.close()
            print("Successfully inserted combined measurement")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    run_test()
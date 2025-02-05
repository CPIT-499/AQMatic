import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry
from src.db.connect import connect_to_db
from src.db.insert_data import insert_measurements

def fetch_air_quality():
    session = requests_cache.CachedSession('.cache', expire_after=3600)
    session = retry(session, retries=5, backoff_factor=0.2)
    client = openmeteo_requests.Client(session=session)
    params = {
        "latitude": 21.4901,
        "longitude": 39.1862,
        "hourly": ["pm10", "pm2_5", "carbon_monoxide", "carbon_dioxide"]
    }
    response = client.weather_api("https://air-quality-api.open-meteo.com/v1/air-quality", params=params)[0]
    return response

def build_hourly_dataframe(response):
    hourly = response.Hourly()
    dates = pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    )
    hourly_dataframe = pd.DataFrame({
        "date": dates,
        "pm10": hourly.Variables(0).ValuesAsNumpy(),
        "pm2_5": hourly.Variables(1).ValuesAsNumpy(),
        "carbon_monoxide": hourly.Variables(2).ValuesAsNumpy(),
        "carbon_dioxide": hourly.Variables(3).ValuesAsNumpy()
    })
    return hourly_dataframe

def run_test():
    response = fetch_air_quality()
    print(f"Coordinates {response.Latitude()}°N {response.Longitude()}°E")
    print(f"Elevation {response.Elevation()} m asl")
    print(f"Timezone {response.Timezone()} {response.TimezoneAbbreviation()}")
    print(f"Timezone difference to GMT+0 {response.UtcOffsetSeconds()} s")
    
    hourly_dataframe = build_hourly_dataframe(response)
    print(hourly_dataframe)

    # Insert measurements into the database
    conn = connect_to_db()
    if conn:
        sensor_id = 1
        location_id = 1
        for _, row in hourly_dataframe.iterrows():
            measurement_time = row['date'].strftime('%Y-%m-%d %H:%M:%S')
            attributes = {
                "pm10": row['pm10'],
                "pm2_5": row['pm2_5'],
                "carbon_monoxide": row['carbon_monoxide'],
                "carbon_dioxide": row['carbon_dioxide']
            }
            insert_measurements(conn, sensor_id, measurement_time, location_id, attributes)
        conn.close()

if __name__ == "__main__":
    run_test()
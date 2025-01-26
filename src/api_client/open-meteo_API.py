#class SensorAPIClient:
#    def __init__(self, api_key: str):
#        self.api_key = api_key
#
#    def get_sensor_readings(self, sensor_id: str):
#       # Fetch sensor data
#        pass





import openmeteo_requests

import requests_cache
import pandas as pd
from retry_requests import retry

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important to assign them correctly below
url = "https://air-quality-api.open-meteo.com/v1/air-quality"
params = {
	"latitude": 21.4901,
	"longitude": 39.1862,
	"hourly": ["pm10", "pm2_5", "carbon_monoxide", "carbon_dioxide", "nitrogen_dioxide", "sulphur_dioxide", "ozone", "aerosol_optical_depth", "dust", "uv_index", "uv_index_clear_sky", "ammonia", "methane", "alder_pollen", "birch_pollen", "grass_pollen", "mugwort_pollen", "olive_pollen", "ragweed_pollen"]
}
responses = openmeteo.weather_api(url, params=params)

# Process first location. Add a for-loop for multiple locations or weather models
response = responses[0]
print(f"Coordinates {response.Latitude()}°N {response.Longitude()}°E")
print(f"Elevation {response.Elevation()} m asl")
print(f"Timezone {response.Timezone()} {response.TimezoneAbbreviation()}")
print(f"Timezone difference to GMT+0 {response.UtcOffsetSeconds()} s")

# Process hourly data. The order of variables needs to be the same as requested.
hourly = response.Hourly()
hourly_pm10 = hourly.Variables(0).ValuesAsNumpy()
hourly_pm2_5 = hourly.Variables(1).ValuesAsNumpy()
hourly_carbon_monoxide = hourly.Variables(2).ValuesAsNumpy()
hourly_carbon_dioxide = hourly.Variables(3).ValuesAsNumpy()
hourly_nitrogen_dioxide = hourly.Variables(4).ValuesAsNumpy()
hourly_sulphur_dioxide = hourly.Variables(5).ValuesAsNumpy()
hourly_ozone = hourly.Variables(6).ValuesAsNumpy()
hourly_aerosol_optical_depth = hourly.Variables(7).ValuesAsNumpy()
hourly_dust = hourly.Variables(8).ValuesAsNumpy()
hourly_uv_index = hourly.Variables(9).ValuesAsNumpy()
hourly_uv_index_clear_sky = hourly.Variables(10).ValuesAsNumpy()
hourly_ammonia = hourly.Variables(11).ValuesAsNumpy()
hourly_methane = hourly.Variables(12).ValuesAsNumpy()
hourly_alder_pollen = hourly.Variables(13).ValuesAsNumpy()
hourly_birch_pollen = hourly.Variables(14).ValuesAsNumpy()
hourly_grass_pollen = hourly.Variables(15).ValuesAsNumpy()
hourly_mugwort_pollen = hourly.Variables(16).ValuesAsNumpy()
hourly_olive_pollen = hourly.Variables(17).ValuesAsNumpy()
hourly_ragweed_pollen = hourly.Variables(18).ValuesAsNumpy()

hourly_data = {"date": pd.date_range(
	start = pd.to_datetime(hourly.Time(), unit = "s", utc = True),
	end = pd.to_datetime(hourly.TimeEnd(), unit = "s", utc = True),
	freq = pd.Timedelta(seconds = hourly.Interval()),
	inclusive = "left"
)}

hourly_data["pm10"] = hourly_pm10
hourly_data["pm2_5"] = hourly_pm2_5
hourly_data["carbon_monoxide"] = hourly_carbon_monoxide
hourly_data["carbon_dioxide"] = hourly_carbon_dioxide

hourly_dataframe = pd.DataFrame(data = hourly_data)
print(hourly_dataframe)


#class SensorAPIClient:
#    def __init__(self, api_key: str):
#        self.api_key = api_key
#
#    def get_sensor_readings(self, sensor_id: str):
#       # Fetch sensor data
#        pass

import requests
import json
from datetime import datetime

# Saudi Cities Configuration
SAUDI_CITIES = {
    "Riyadh": {"lat": 24.7136, "lon": 46.6753},
    "Jeddah": {"lat": 21.5433, "lon": 39.1728},
    "Mecca": {"lat": 21.3891, "lon": 39.8579},
    "Medina": {"lat": 24.5247, "lon": 39.5692},
    "Dammam": {"lat": 26.4207, "lon": 50.0888},
    "Taif": {"lat": 21.4267, "lon": 40.4833}
}

API_KEY = "API key here"

def get_all_cities_air_quality():
    results = {}
    
    for city, coords in SAUDI_CITIES.items():
        try:
            base_url = "http://api.openweathermap.org/data/2.5/air_pollution"
            url = f"{base_url}?lat={coords['lat']}&lon={coords['lon']}&appid={API_KEY}"
            
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            air_quality = data['list'][0]
            timestamp = datetime.fromtimestamp(air_quality['dt']).strftime('%Y-%m-%d %H:%M:%S')
            
            print(f"\n=== Air Quality Data for {city} ===")
            print(f"Time: {timestamp}")
            print(f"AQI: {air_quality['main']['aqi']}")
            print("Pollutants (μg/m³):")
            for gas, value in air_quality['components'].items():
                print(f"{gas.upper()}: {value}")
            
            results[city] = {
                'timestamp': timestamp,
                'aqi': air_quality['main']['aqi'],
                'components': air_quality['components']
            }
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data for {city}: {e}")
    
    return results

if __name__ == "__main__":
    get_all_cities_air_quality()
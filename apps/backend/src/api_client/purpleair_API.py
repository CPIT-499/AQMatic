#class SensorAPIClient:
#    def __init__(self, api_key: str):
#        self.api_key = api_key
#
#    def get_sensor_readings(self, sensor_id: str):
#       # Fetch sensor data
#        pass


#website Link https://map.purpleair.com/air-quality-standards-us-epa-aqi?opt=%2F1%2Flp%2Fa10%2Fp604800%2FcC0#4.94/25.13/44.35
#sensor index near jeddah = 36711
#sensor index riyadh = 36713
import requests
import json

# PurpleAir API Configuration
API_KEY = "API key here"
SENSOR_INDEX = "36711"  # Replace with actual sensor index

def get_sensor_data(sensor_index):
    try:
        url = f"https://api.purpleair.com/v1/sensors/{sensor_index}"
        headers = {
            "X-API-Key": API_KEY
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        print(f"\n=== Sensor Data for Sensor Index {sensor_index} ===")
        print(json.dumps(data, indent=4))
        
        return data
    
    

        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

if __name__ == "__main__":
    get_sensor_data(SENSOR_INDEX)
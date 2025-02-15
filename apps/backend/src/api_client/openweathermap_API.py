import requests
from datetime import datetime
from src.db.connect import connect_to_db
from src.db.insert_data import insert_measurements

# Saudi Cities Configuration with coordinates
SAUDI_CITIES = {
    "Riyadh": {"lat": 24.7136, "lon": 46.6753},
    "Jeddah": {"lat": 21.5433, "lon": 39.1728},
    "Mecca": {"lat": 21.3891, "lon": 39.8579},
    "Medina": {"lat": 24.5247, "lon": 39.5692},
    "Dammam": {"lat": 26.4207, "lon": 50.0888},
    "Taif": {"lat": 21.4267, "lon": 40.4833}
}

# Mapping from city name to location_id based on your locations table
CITY_LOCATION_MAP = {
    "Riyadh": 6,
    "Jeddah": 7,
    "Mecca": 8,
    "Medina": 9,
    "Dammam": 10,
    "Taif": 11
}

API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Replace with your OpenWeatherMap API key

# Mapping for each attribute_id to the measurement key in our dictionary.
ATTRIBUTES_MAP = {
    1: "temperature",        # °C
    2: "humidity",           # %
    3: "co2",                # ppm
    4: "pm2.5",              # µg/m³
    5: "wind_speed",         # m/s
    6: "pm10",               # µg/m³
    7: "no2",                # ppb
    8: "so2",                # ppb
    9: "co",                 # ppm
    10: "o3",                # ppb
    11: "methane",           # ppb
    12: "nitrous_oxide",     # ppb
    13: "fluorinated_gases"  # ppt
}

def get_city_measurements(city, coords):
    # Fetch current weather data from OpenWeatherMap weather API
    weather_url = (
        f"http://api.openweathermap.org/data/2.5/weather?"
        f"lat={coords['lat']}&lon={coords['lon']}&appid={API_KEY}"
    )
    weather_response = requests.get(weather_url)
    weather_response.raise_for_status()
    weather_data = weather_response.json()
    
    # Convert temperature from Kelvin to Celsius
    temperature = weather_data["main"]["temp"] - 273.15
    humidity = float(weather_data["main"]["humidity"])
    wind_speed = float(weather_data["wind"]["speed"])
    
    # Fetch air pollution data
    air_url = (
        f"http://api.openweathermap.org/data/2.5/air_pollution?"
        f"lat={coords['lat']}&lon={coords['lon']}&appid={API_KEY}"
    )
    air_response = requests.get(air_url)
    air_response.raise_for_status()
    air_data = air_response.json()
    components = air_data['list'][0]['components']
    
    # Extract available pollutant values from API
    co = float(components.get("co", 0))
    no2 = float(components.get("no2", 0))
    o3 = float(components.get("o3", 0))
    so2 = float(components.get("so2", 0))
    pm2_5 = float(components.get("pm2_5", 0))
    pm10 = float(components.get("pm10", 0))
    
    # Attributes not provided by the API – default 0.0 values
    co2 = 0.0
    methane = 0.0
    nitrous_oxide = 0.0
    fluorinated_gases = 0.0
    
    # Use the weather data timestamp
    timestamp = datetime.fromtimestamp(weather_data["dt"]).strftime("%Y-%m-%d %H:%M:%S")
    
    return {
        "temperature": temperature,
        "humidity": humidity,
        "co2": co2,
        "pm2.5": pm2_5,
        "wind_speed": wind_speed,
        "pm10": pm10,
        "no2": no2,
        "so2": so2,
        "co": co,
        "o3": o3,
        "methane": methane,
        "nitrous_oxide": nitrous_oxide,
        "fluorinated_gases": fluorinated_gases,
        "timestamp": timestamp
    }

def get_all_cities_measurements():
    results = {}
    for city, coords in SAUDI_CITIES.items():
        try:
            measurements = get_city_measurements(city, coords)
            print(f"\n=== Measurement Data for {city} ===")
            print(f"Time: {measurements['timestamp']}")
            print(f"Temperature: {measurements['temperature']} °C")
            print(f"Humidity: {measurements['humidity']} %")
            print(f"CO2: {measurements['co2']} ppm")
            print(f"PM2.5: {measurements['pm2.5']} µg/m³")
            print(f"Wind Speed: {measurements['wind_speed']} m/s")
            print(f"PM10: {measurements['pm10']} µg/m³")
            print(f"NO2: {measurements['no2']} ppb")
            print(f"SO2: {measurements['so2']} ppb")
            print(f"CO: {measurements['co']} ppm")
            print(f"O3: {measurements['o3']} ppb")
            print(f"Methane: {measurements['methane']} ppb")
            print(f"Nitrous Oxide: {measurements['nitrous_oxide']} ppb")
            print(f"Fluorinated Gases: {measurements['fluorinated_gases']} ppt")
            
            results[city] = measurements
            
            # Determine the location_id for the city
            location_id = CITY_LOCATION_MAP.get(city, 1)
            
            # Insert the complete measurement as a single record
            conn = connect_to_db()
            if conn:
                attributes = {
                    "temperature": float(measurements["temperature"]),
                    "humidity": float(measurements["humidity"]),
                    "co2": float(measurements["co2"]),
                    "pm2.5": float(measurements["pm2.5"]),
                    "wind_speed": float(measurements["wind_speed"]),
                    "pm10": float(measurements["pm10"]),
                    "no2": float(measurements["no2"]),
                    "so2": float(measurements["so2"]),
                    "co": float(measurements["co"]),
                    "o3": float(measurements["o3"]),
                    "methane": float(measurements["methane"]),
                    "nitrous_oxide": float(measurements["nitrous_oxide"]),
                    "fluorinated_gases": float(measurements["fluorinated_gases"])
                }
                insert_measurements(
                    conn,
                    sensor_id=2,
                    measurement_time=measurements["timestamp"],
                    location_id=location_id,
                    attributes=attributes
                )
                conn.close()
                print("Successfully inserted measurement for", city)
        
        except Exception as e:
            print(f"Error fetching measurement for {city}: {e}")
    return results

if __name__ == "__main__":
    get_all_cities_measurements()
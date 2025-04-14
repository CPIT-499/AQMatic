from typing import Union, List, Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from .database import get_db
from . import utils  # Import the utils module
from sqlalchemy.orm import Session
from sqlalchemy import text

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # For production, specify your frontend URL instead of "*"
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    # You'll need to modify this since POSTGRES_USER won't be defined anymore
    return {"Hello": "AQMatic API"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.get("/hourly_measurement_summary_View_graph")
def get_hourly_measurement_summary(db=Depends(get_db)):
    """
    Retrieve data from the hourly_measurement_summary_View_graph
    """
    result = db.execute("SELECT * FROM hourly_measurement_summary_View_graph").fetchall()
    #http://localhost:8000/hourly_measurement_summary_View_graph
    # Format the data using the utils module
    formatted_data = utils.format_hourly_measurement_data(result)

    return formatted_data


@app.get("/map_data")
async def get_map_data(
    db: Session = Depends(get_db),
    organization_id: Optional[int] = None
):
    """
    Get map data for visualization.
    If organization_id is provided, only return data for that organization.
    If no organization_id is provided, return all public data.
    """
    try:
        # Base query
        query = "SELECT * FROM map_data_view"
        
        # Add organization filter if provided
        #if organization_id is not None:
        #    query += f" WHERE organization_id = {organization_id}"
        
        # Execute query
        result = db.execute(text(query))
        rows = result.fetchall()
        
        # Format the data
        formatted_data = []
        for row in rows:
            data = {
                "location_id": row.location_id,
                "latitude": float(row.latitude),
                "longitude": float(row.longitude),
                "city": row.city,
                "region": row.region,
                "country": row.country,
                #"organization_id": row.organization_id,
                #"organization_name": row.organization_name,
                # Air Quality Measurements
                "pm25": float(row.pm25) if row.pm25 is not None else None,
                "pm10": float(row.pm10) if row.pm10 is not None else None,
                "o3": float(row.o3) if row.o3 is not None else None,
                "no2": float(row.no2) if row.no2 is not None else None,
                "so2": float(row.so2) if row.so2 is not None else None,
                "co": float(row.co) if row.co is not None else None,
                # Weather Measurements
                "temperature": float(row.temperature) if row.temperature is not None else None,
                "humidity": float(row.humidity) if row.humidity is not None else None,
                "wind_speed": float(row.wind_speed) if row.wind_speed is not None else None,
                # Greenhouse Gases
                "co2": float(row.co2) if row.co2 is not None else None,
                "methane": float(row.methane) if row.methane is not None else None,
                "nitrous_oxide": float(row.nitrous_oxide) if row.nitrous_oxide is not None else None,
                "fluorinated_gases": float(row.fluorinated_gases) if row.fluorinated_gases is not None else None,
                "intensity": float(row.intensity) if row.intensity is not None else None
            }
            formatted_data.append(data)
        
        return formatted_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/location_measurements/{location_id}")
async def get_location_measurements(location_id: int, db: Session = Depends(get_db)):
    try:
        # Get the latest measurements for each attribute at this location
        query = """
        WITH latest_measurements AS (
            SELECT 
                m.location_id,
                m.attribute_id,
                m.value,
                m.measurement_time,
                ma.attribute_name,
                ma.unit,
                ROW_NUMBER() OVER (PARTITION BY m.attribute_id ORDER BY m.measurement_time DESC) as rn
            FROM measurements m
            JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
            WHERE m.location_id = :location_id
            AND m.measurement_time >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
        )
        SELECT 
            location_id,
            attribute_name,
            value,
            unit,
            measurement_time
        FROM latest_measurements
        WHERE rn = 1
        ORDER BY attribute_name;
        """
        
        result = db.execute(text(query), {"location_id": location_id})
        measurements = result.fetchall()
        
        if not measurements:
            return {"location_id": location_id, "measurements": []}
            
        return {
            "location_id": location_id,
            "measurements": [
                {
                    "attribute_name": row.attribute_name,
                    "value": float(row.value),
                    "unit": row.unit,
                    "measurement_time": row.measurement_time.isoformat()
                }
                for row in measurements
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
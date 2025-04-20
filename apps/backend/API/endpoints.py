"""
API endpoints module for AQMatic.
Contains endpoint handlers for data retrieval.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
from pydantic import BaseModel
import os

from .database import get_db
from .utils import format_hourly_measurement_data, measure_aqi, process_dashboard_stats
from .auth import User, get_current_user

# API endpoint handler functions
def get_hourly_measurement_summary_handler(db: Session, organization_id: Optional[int] = None):
    """
    Retrieve data from the hourly_measurement_summary_View_graph
    Filtered by organization_id if provided
    """
    try:
        query = "SELECT * FROM hourly_measurement_summary_View_graph"
        params = {}
        
        # Add organization filter if provided
        if organization_id is not None:
            query += " WHERE organization_id = :organization_id"
            params["organization_id"] = organization_id
            
        result = db.execute(text(query), params).fetchall()
        
        # Format the data using the utils module
        try:
            formatted_data = format_hourly_measurement_data(result)
        except Exception as format_error:
            # If the custom formatting fails, use a simple fallback approach
            print(f"Warning: Error in format_hourly_measurement_data: {str(format_error)}")
            formatted_data = []
            for row in result:
                data_point = {}
                # Map all row attributes to the dict, safely
                for key in row.keys():
                    try:
                        # Convert values to the appropriate Python types
                        value = getattr(row, key)
                        if isinstance(value, (int, float)):
                            data_point[key] = value
                        elif isinstance(value, str):
                            data_point[key] = value
                        elif value is None:
                            data_point[key] = None
                        else:
                            data_point[key] = str(value)
                    except Exception:
                        data_point[key] = None
                
                formatted_data.append(data_point)
        
        return formatted_data
    except Exception as e:
        # Log the error for debugging
        import traceback
        print(f"Error in get_hourly_measurement_summary_handler: {str(e)}")
        print(traceback.format_exc())
        
        # Return empty data instead of raising an exception
        return []

async def get_map_data_handler(db: Session, organization_id: Optional[int] = None):
    """
    Get map data for visualization.
    If organization_id is provided, only return data for that organization.
    If no organization_id is provided, return all public data.
    """
    try:
        # Base query - check if organization_id column exists
        try:
            # First check if the column exists in the view
            check_query = "SELECT column_name FROM information_schema.columns WHERE table_name = 'map_data_view' AND column_name = 'organization_id'"
            has_org_id = db.execute(text(check_query)).fetchone() is not None
        except Exception:
            has_org_id = False
            print("Warning: Could not verify if organization_id column exists in map_data_view")
        
        # Base query
        query = "SELECT * FROM map_data_view"
        params = {}
        
        # Add organization filter if provided and column exists
        if organization_id is not None and has_org_id:
            query += " WHERE organization_id = :organization_id"
            params["organization_id"] = organization_id
        
        # Execute query
        result = db.execute(text(query), params)
        rows = result.fetchall()
        
        # Format the data
        formatted_data = []
        for row in rows:
            # Create a dict with safe values, checking if columns exist
            data = {
                "location_id": row.location_id if hasattr(row, 'location_id') else None,
                "latitude": float(row.latitude) if hasattr(row, 'latitude') and row.latitude is not None else 0.0,
                "longitude": float(row.longitude) if hasattr(row, 'longitude') and row.longitude is not None else 0.0,
                "city": row.city if hasattr(row, 'city') else "",
                "region": row.region if hasattr(row, 'region') else "",
                "country": row.country if hasattr(row, 'country') else "",
                # Default to None for optional fields
                "organization_id": row.organization_id if hasattr(row, 'organization_id') else None,
                # Air Quality Measurements
                "pm25": float(row.pm25) if hasattr(row, 'pm25') and row.pm25 is not None else None,
                "pm10": float(row.pm10) if hasattr(row, 'pm10') and row.pm10 is not None else None,
                "o3": float(row.o3) if hasattr(row, 'o3') and row.o3 is not None else None,
                "no2": float(row.no2) if hasattr(row, 'no2') and row.no2 is not None else None,
                "so2": float(row.so2) if hasattr(row, 'so2') and row.so2 is not None else None,
                "co": float(row.co) if hasattr(row, 'co') and row.co is not None else None,
                # Weather Measurements
                "temperature": float(row.temperature) if hasattr(row, 'temperature') and row.temperature is not None else None,
                "humidity": float(row.humidity) if hasattr(row, 'humidity') and row.humidity is not None else None,
                "wind_speed": float(row.wind_speed) if hasattr(row, 'wind_speed') and row.wind_speed is not None else None,
                # Greenhouse Gases
                "co2": float(row.co2) if hasattr(row, 'co2') and row.co2 is not None else None,
                "methane": float(row.methane) if hasattr(row, 'methane') and row.methane is not None else None,
                "nitrous_oxide": float(row.nitrous_oxide) if hasattr(row, 'nitrous_oxide') and row.nitrous_oxide is not None else None,
                "fluorinated_gases": float(row.fluorinated_gases) if hasattr(row, 'fluorinated_gases') and row.fluorinated_gases is not None else None,
                "intensity": float(row.intensity) if hasattr(row, 'intensity') and row.intensity is not None else None
            }
            formatted_data.append(data)
        
        return formatted_data
    except Exception as e:
        # Log the error for debugging
        import traceback
        print(f"Error in get_map_data_handler: {str(e)}")
        print(traceback.format_exc())
        
        # Return empty data instead of raising an error
        return []

async def get_location_measurements_handler(location_id: int, db: Session, organization_id: Optional[int] = None):
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
                l.organization_id,
                ROW_NUMBER() OVER (PARTITION BY m.attribute_id ORDER BY m.measurement_time DESC) as rn
            FROM measurements m
            JOIN measurement_attributes ma ON m.attribute_id = ma.attribute_id
            JOIN locations l ON m.location_id = l.location_id
            WHERE m.location_id = :location_id
            AND m.measurement_time >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
        )
        SELECT 
            location_id,
            attribute_name,
            value,
            unit,
            measurement_time,
            organization_id
        FROM latest_measurements
        WHERE rn = 1
        """
        
        params = {"location_id": location_id}
        
        # Add organization filter if provided
        if organization_id is not None:
            query += " AND organization_id = :organization_id"
            params["organization_id"] = organization_id
            
        query += " ORDER BY attribute_name;"
        
        result = db.execute(text(query), params)
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

def get_aqi_data_handler(db: Session, location_id: Optional[int] = None, organization_id: Optional[int] = None):
    """
    Retrieve AQI data calculated from aqi_view and measure_aqi function
    Filtered by organization_id if provided
    """
    # Base query
    query = "SELECT * FROM aqi_view"
    
    # Add filters if provided
    filters = []
    params = {}
    
    if location_id is not None:
        filters.append("location_id = :location_id")
        params["location_id"] = location_id
        
    if organization_id is not None:
        filters.append("organization_id = :organization_id")
        params["organization_id"] = organization_id
        
    if filters:
        query += " WHERE " + " AND ".join(filters)
    
    # Execute query
    result = db.execute(text(query), params).fetchall()
    
    # Format and process the data
    formatted_data = []
    for row in result:
        # Extract pollutant values
        pollutant_data = {
            "pm2.5": float(row.pm25_value) if row.pm25_value is not None else None,
            "pm10": float(row.pm10_value) if row.pm10_value is not None else None,
            "o3": float(row.o3_value) if row.o3_value is not None else None,
            "no2": float(row.no2_value) if row.no2_value is not None else None,
            "so2": float(row.so2_value) if row.so2_value is not None else None,
            "co": float(row.co_value) if row.co_value is not None else None
        }
        
        # Calculate AQI using the measure_aqi function
        aqi_results = measure_aqi(pollutant_data)
        
        # Create the response data
        data = {
            "location_id": row.location_id,
            "city": row.city,
            "region": row.region,
            "country": row.country,
            "organization_id": row.organization_id,
            "organization_name": row.organization_name,
            "aqi": aqi_results.get("AQI"),
            # Include individual pollutant AQIs
            "pm25_aqi": aqi_results.get("pm2.5"),
            "pm10_aqi": aqi_results.get("pm10"),
            "o3_aqi": aqi_results.get("o3"),
            "no2_aqi": aqi_results.get("no2"),
            "so2_aqi": aqi_results.get("so2"),
            "co_aqi": aqi_results.get("co"),
            # Include raw values
            "pm25": pollutant_data["pm2.5"],
            "pm10": pollutant_data["pm10"],
            "o3": pollutant_data["o3"],
            "no2": pollutant_data["no2"],
            "so2": pollutant_data["so2"],
            "co": pollutant_data["co"]
        }
        formatted_data.append(data)

    return formatted_data

def get_location_aqi_handler(location_id: int, db: Session, organization_id: Optional[int] = None):
    """
    Get AQI data for a specific location
    Filtered by organization_id if provided
    """
    return get_aqi_data_handler(db, location_id=location_id, organization_id=organization_id)

def get_org_summary_stats_handler(organization_id: int, db: Session):
    """
    Retrieve raw summary statistics from dashboard_summary_stats_view
    for a specific organization
    """
    try:
        query = "SELECT * FROM dashboard_summary_stats_view WHERE organization_id = :organization_id"
        params = {"organization_id": organization_id}
        result = db.execute(text(query), params).fetchall()
        
        if not result:
            return {
                "current_aqi": 0,
                "pm25_level": 0,
                "aqi_trend_pct": 0,
                "pm25_trend_pct": 0,
                "monitoring_stations": 0,
                "alerts_today": 0
            }
            
        # Process the raw data using the utility function
        processed_stats = process_dashboard_stats(result)
        
        # Return the specific organization's stats
        if str(organization_id) in processed_stats:
            org_data = processed_stats[str(organization_id)]
            return {
                "current_aqi": org_data["current_aqi"]["value"],
                "pm25_level": org_data["pm25_level"]["value"],
                "aqi_trend_pct": float(org_data["current_aqi"]["trend"]["value"].replace("%", "").replace("+", "")),
                "pm25_trend_pct": float(org_data["pm25_level"]["trend"]["value"].replace("%", "").replace("+", "")),
                "monitoring_stations": org_data["monitoring_stations"]["value"],
                "alerts_today": org_data["alerts_today"]["value"]
            }
        else:
            # If the organization_id doesn't match any processed data
            return {
                "current_aqi": 0,
                "pm25_level": 0,
                "aqi_trend_pct": 0,
                "pm25_trend_pct": 0,
                "monitoring_stations": 0,
                "alerts_today": 0
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
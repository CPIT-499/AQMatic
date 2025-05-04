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
from .utils import format_hourly_measurement_data, measure_aqi, process_dashboard_stats, format_forecast_data

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
            print(f"Warning: Error in format_hourly_measurement_data: {str(format_error)}")
            formatted_data = []
            for row in result:
                data_point = {}
                for key in row.keys():
                    try:
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
        print(f"Error in get_hourly_measurement_summary_handler: {str(e)}")
        return []


async def get_map_data_handler(db: Session, organization_id: Optional[int] = None):
    """
    Get map data for all locations
    Filtered by organization_id if provided
    """
    try:
        query = "SELECT * FROM map_data_view"
        params = {}
        
        # Add organization filter if provided
        if organization_id is not None:
            query += " WHERE organization_id = :organization_id"
            params["organization_id"] = organization_id
            
        result = db.execute(text(query), params)
        rows = result.fetchall()
        
        formatted_data = []
        for row in rows:
            data = {
                "location_id": row.location_id if hasattr(row, 'location_id') else None,
                "latitude": float(row.latitude) if hasattr(row, 'latitude') and row.latitude is not None else 0.0,
                "longitude": float(row.longitude) if hasattr(row, 'longitude') and row.longitude is not None else 0.0,
                "city": row.city if hasattr(row, 'city') else "",
                "region": row.region if hasattr(row, 'region') else "",
                "country": row.country if hasattr(row, 'country') else "",
                "organization_id": row.organization_id if hasattr(row, 'organization_id') else None,
                "pm25": float(row.pm25) if hasattr(row, 'pm25') and row.pm25 is not None else None,
                "pm10": float(row.pm10) if hasattr(row, 'pm10') and row.pm10 is not None else None,
                "o3": float(row.o3) if hasattr(row, 'o3') and row.o3 is not None else None,
                "no2": float(row.no2) if hasattr(row, 'no2') and row.no2 is not None else None,
                "so2": float(row.so2) if hasattr(row, 'so2') and row.so2 is not None else None,
                "co": float(row.co) if hasattr(row, 'co') and row.co is not None else None,
                "temperature": float(row.temperature) if hasattr(row, 'temperature') and row.temperature is not None else None,
                "humidity": float(row.humidity) if hasattr(row, 'humidity') and row.humidity is not None else None,
                "wind_speed": float(row.wind_speed) if hasattr(row, 'wind_speed') and row.wind_speed is not None else None,
                "co2": float(row.co2) if hasattr(row, 'co2') and row.co2 is not None else None,
                "methane": float(row.methane) if hasattr(row, 'methane') and row.methane is not None else None,
                "nitrous_oxide": float(row.nitrous_oxide) if hasattr(row, 'nitrous_oxide') and row.nitrous_oxide is not None else None,
                "fluorinated_gases": float(row.fluorinated_gases) if hasattr(row, 'fluorinated_gases') and row.fluorinated_gases is not None else None,
                "intensity": float(row.intensity) if hasattr(row, 'intensity') and row.intensity is not None else None
            }
            formatted_data.append(data)
        
        return formatted_data
    except Exception as e:
        print(f"Error in get_map_data_handler: {str(e)}")
        return []



def get_summary_stats_handler(db: Session, organization_id: Optional[int] = None):
    """
    Unified function to retrieve air quality summary statistics.
    If organization_id is provided, returns stats for that organization.
    Otherwise returns aggregated stats for all public organizations.
    """
    try:
        if organization_id is not None:
            # Get stats for specific organization
            query = """
                SELECT
                    pm25_current, pm10_current, o3_current, no2_current, so2_current, co_current,
                    pm25_previous, pm10_previous, o3_previous, no2_previous, so2_previous, co_previous,
                    pm25_hours_diff, pm10_hours_diff, o3_hours_diff, no2_hours_diff, so2_hours_diff, co_hours_diff,
                    monitoring_stations, alerts_today
                FROM dashboard_summary_stats_view
                WHERE organization_id = :organization_id
            """
            params = {"organization_id": organization_id}
            previous_field_name = "previous"
        else:
            # Get stats for all public organizations
            query = """
                SELECT
                    pm25_current, pm10_current, o3_current, no2_current, so2_current, co_current,
                    pm25_previous, pm10_previous, o3_previous, no2_previous, so2_previous, co_previous,
                    monitoring_stations, alerts_today
                FROM dashboard_summary_stats_view
                WHERE role = 'public'
            """
            params = {}
            previous_field_name = "previous"
        
        result = db.execute(text(query), params).fetchall()
        
        if not result:
            # Return default values if no data found
            return {
                "current_aqi": 0, "pm25_level": 0, "aqi_trend_pct": 0, "pm25_trend_pct": 0,
                "monitoring_stations": 0, "alerts_today": 0,
                **({"hours_since_previous": 0} if organization_id else {})
            }
        
        # Initialize variables
        totals = {
            "current_aqi": 0, "current_pm25": 0, "previous_aqi": 0, "previous_pm25": 0,
            "stations": 0, "alerts": 0, "hours_diff": 0
        }
        counts = {"rows": 0, "trends": 0, "hours": 0}
        
        # Process rows
        for row in result:
            counts["rows"] += 1
            totals["stations"] += row.monitoring_stations or 0
            totals["alerts"] += row.alerts_today or 0
            
            # Calculate current AQI
            current_pollutants = {
                "pm2.5": row.pm25_current, "pm10": row.pm10_current, "o3": row.o3_current,
                "no2": row.no2_current, "so2": row.so2_current, "co": row.co_current
            }
            valid_current = {k: v for k, v in current_pollutants.items() if v is not None}
            
            current_aqi = 0
            if valid_current:
                aqi_result = measure_aqi(valid_current)
                current_aqi = aqi_result.get("AQI", 0)
                totals["current_aqi"] += current_aqi
            
            current_pm25 = row.pm25_current or 0
            totals["current_pm25"] += current_pm25
            
            # Calculate previous values for trend
            previous_pollutants = {
                "pm2.5": row.pm25_previous, "pm10": row.pm10_previous, "o3": row.o3_previous,
                "no2": row.no2_previous, "so2": row.so2_previous, "co": row.co_previous
            }
            valid_previous = {k: v for k, v in previous_pollutants.items() if v is not None}
            
            if valid_previous:
                previous_aqi = measure_aqi(valid_previous).get("AQI", 0)
                previous_pm25 = row.pm25_previous or 0
                
                if current_aqi > 0 and previous_aqi > 0:
                    totals["previous_aqi"] += previous_aqi
                    totals["previous_pm25"] += previous_pm25
                    counts["trends"] += 1
            
            # For org-specific case, calculate hours difference
            if organization_id is not None:
                hours_fields = [row.pm25_hours_diff, row.pm10_hours_diff, row.o3_hours_diff,
                               row.no2_hours_diff, row.so2_hours_diff, row.co_hours_diff]
                valid_hours = [h for h in hours_fields if h is not None]
                if valid_hours:
                    totals["hours_diff"] += sum(valid_hours)
                    counts["hours"] += len(valid_hours)
        
        # Calculate averages and trends
        avg_current_aqi = round(totals["current_aqi"] / counts["rows"], 1) if counts["rows"] > 0 else 0
        avg_pm25 = round(totals["current_pm25"] / counts["rows"], 1) if counts["rows"] > 0 else 0
        
        # Calculate trend percentages
        aqi_trend_pct = 0
        pm25_trend_pct = 0
        if counts["trends"] > 0:
            avg_previous_aqi = totals["previous_aqi"] / counts["trends"]
            avg_previous_pm25 = totals["previous_pm25"] / counts["trends"]
            
            if avg_previous_aqi != 0:
                aqi_trend_pct = round(((avg_current_aqi - avg_previous_aqi) / avg_previous_aqi) * 100, 1)
            if avg_previous_pm25 != 0:
                pm25_trend_pct = round(((avg_pm25 - avg_previous_pm25) / avg_previous_pm25) * 100, 1)
        
        # Prepare result
        result = {
            "current_aqi": avg_current_aqi,
            "pm25_level": avg_pm25,
            "aqi_trend_pct": aqi_trend_pct,
            "pm25_trend_pct": pm25_trend_pct,
            "monitoring_stations": totals["stations"],
            "alerts_today": totals["alerts"]
        }
        
        # Add hours_since_previous for organization-specific case
        if organization_id is not None:
            avg_hours = round(totals["hours_diff"] / counts["hours"], 1) if counts["hours"] > 0 else 0
            result["hours_since_previous"] = avg_hours
        
        return result
        
    except Exception as e:
        import traceback
        print(f"Error in get_summary_stats_handler: {str(e)}")
        print(traceback.format_exc())
        
        # Return default values in case of error
        default = {
            "current_aqi": 0, "pm25_level": 0, "aqi_trend_pct": 0, "pm25_trend_pct": 0,
            "monitoring_stations": 0, "alerts_today": 0
        }
        if organization_id is not None:
            default["hours_since_previous"] = 0
        return default

def get_forecast_summary_handler(db: Session, organization_id: Optional[int] = None):
    """
    Retrieve data from the forecast_summary_view
    Filtered by organization_id if provided
    """
    try:
        query = "SELECT * FROM forecast_summary_view"
        params = {}
        
        # Add organization filter if provided
        if organization_id is not None:
            query += " WHERE organization_id = :organization_id"
            params["organization_id"] = organization_id
            
        result = db.execute(text(query), params).fetchall()
        
        # Use format_forecast_data to format the data like hourly_measurement_data
        try:
            formatted_data = format_forecast_data(result)
        except Exception as format_error:
            print(f"Warning: Error in format_forecast_data: {str(format_error)}")
            # Fallback formatting if the custom formatter fails
            formatted_data = []
            for row in result:
                data_point = {}
                for key in row.keys():
                    try:
                        value = getattr(row, key)
                        if key == "target_time":
                            # Extract date part if it's a string with timestamp format
                            if isinstance(value, str):
                                date_str = value.split()[0]  # Get "2025-05-02" from the timestamp
                                data_point[key] = format_forecast_date(date_str)
                            elif value:  # If it's a datetime object
                                data_point[key] = value.strftime("%B %d").replace(" 0", " ")
                            else:
                                data_point[key] = None
                        elif isinstance(value, (int, float)):
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
        print(f"Error in get_forecast_summary_handler: {str(e)}")
        return []


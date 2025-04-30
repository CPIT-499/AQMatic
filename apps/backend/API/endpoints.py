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



def get_location_aqi_handler(location_id: int, db: Session, organization_id: Optional[int] = None):
    """
    Get AQI data for a specific location
    Filtered by organization_id if provided
    """
    return get_aqi_data_handler(db, location_id=location_id, organization_id=organization_id)

def get_org_summary_stats_handler(organization_id: int, db: Session):
    """
    Retrieve and process summary statistics for a specific organization
    using the same calculation approach as the public stats handler.
    """
    try:
        # Get summary stats for the specified organization
        # Select the same columns as in the public stats handler
        query = """
            SELECT
                pm25_current, pm10_current, o3_current, no2_current, so2_current, co_current,
                pm25_yesterday, pm10_yesterday, o3_yesterday, no2_yesterday, so2_yesterday, co_yesterday,
                monitoring_stations, alerts_today
            FROM dashboard_summary_stats_view
            WHERE organization_id = :organization_id
        """
        params = {"organization_id": organization_id}
        result = db.execute(text(query), params).fetchall()

        if not result:
            # Return default values if no data found for this organization
            return {
                "current_aqi": 0,
                "pm25_level": 0,
                "aqi_trend_pct": 0,
                "pm25_trend_pct": 0,
                "monitoring_stations": 0,
                "alerts_today": 0
            }

        # Unlike the public stats, we're dealing with one organization,
        # so we don't need to average across multiple rows
        row = result[0]  # Take the first row for the organization

        # --- Calculate Current AQI ---
        current_pollutants = {
            "pm2.5": row.pm25_current, "pm10": row.pm10_current,
            "o3": row.o3_current, "no2": row.no2_current,
            "so2": row.so2_current, "co": row.co_current
        }
        
        # Filter out None values before calculating AQI
        valid_current_pollutants = {k: v for k, v in current_pollutants.items() if v is not None}
        current_aqi_value = 0
        if valid_current_pollutants:
            aqi_result = measure_aqi(valid_current_pollutants)
            current_aqi_value = aqi_result.get("AQI", 0)

        # Get current PM2.5
        current_pm25 = row.pm25_current or 0

        # --- Calculate Trends ---
        yesterday_pollutants = {
            "pm2.5": row.pm25_yesterday, "pm10": row.pm10_yesterday,
            "o3": row.o3_yesterday, "no2": row.no2_yesterday,
            "so2": row.so2_yesterday, "co": row.co_yesterday
        }
        
        valid_yesterday_pollutants = {k: v for k, v in yesterday_pollutants.items() if v is not None}
        yesterday_aqi_value = 0
        if valid_yesterday_pollutants:
            aqi_yesterday_result = measure_aqi(valid_yesterday_pollutants)
            yesterday_aqi_value = aqi_yesterday_result.get("AQI", 0)

        yesterday_pm25 = row.pm25_yesterday or 0

        # Calculate percentage change for AQI and PM2.5
        aqi_trend_pct = 0
        if yesterday_aqi_value != 0:
            aqi_trend_pct = round(((current_aqi_value - yesterday_aqi_value) / yesterday_aqi_value) * 100, 1)

        pm25_trend_pct = 0
        if yesterday_pm25 != 0:
            pm25_trend_pct = round(((current_pm25 - yesterday_pm25) / yesterday_pm25) * 100, 1)

        # Return the organization stats
        return {
            "current_aqi": current_aqi_value,
            "pm25_level": current_pm25,
            "aqi_trend_pct": aqi_trend_pct,
            "pm25_trend_pct": pm25_trend_pct,
            "monitoring_stations": row.monitoring_stations or 0,
            "alerts_today": row.alerts_today or 0
        }

    except Exception as e:
        import traceback
        print(f"Error in get_org_summary_stats_handler for organization {organization_id}: {str(e)}")
        print(traceback.format_exc())

        # Return default values in case of any error during processing
        return {
            "current_aqi": 0,
            "pm25_level": 0,
            "aqi_trend_pct": 0,
            "pm25_trend_pct": 0,
            "monitoring_stations": 0,
            "alerts_today": 0
        }

def get_public_summary_stats_handler(db: Session):
    """
    Retrieve and aggregate summary statistics from dashboard_summary_stats_view
    for organizations with role = 'public', calculating AQI and trends.
    """
    try:
        # Get all summary stats for public organizations
        # Select specific columns needed for calculation
        query = """
            SELECT
                pm25_current, pm10_current, o3_current, no2_current, so2_current, co_current,
                pm25_yesterday, pm10_yesterday, o3_yesterday, no2_yesterday, so2_yesterday, co_yesterday,
                monitoring_stations, alerts_today
            FROM dashboard_summary_stats_view
            WHERE role = 'public'
        """
        result = db.execute(text(query)).fetchall()

        if not result:
            # Return default values if no public data found
            return {
                "current_aqi": 0,
                "pm25_level": 0,
                "aqi_trend_pct": 0,
                "pm25_trend_pct": 0,
                "monitoring_stations": 0,
                "alerts_today": 0
            }

        # Initialize totals and count
        total_pm25 = 0
        total_stations = 0
        total_alerts = 0
        total_calculated_aqi = 0
        total_calculated_aqi_yesterday = 0 # To calculate AQI trend
        total_pm25_yesterday = 0 # To calculate PM2.5 trend
        valid_aqi_rows = 0
        valid_pm25_rows = 0
        valid_trend_rows = 0
        row_count = 0

        # Process each row, replacing NULLs with 0 and calculating AQI/trends
        for row in result:
            row_count += 1
            total_stations += row.monitoring_stations or 0
            total_alerts += row.alerts_today or 0

            # --- Calculate Current AQI ---
            current_pollutants = {
                "pm2.5": row.pm25_current, "pm10": row.pm10_current,
                "o3": row.o3_current, "no2": row.no2_current,
                "so2": row.so2_current, "co": row.co_current
            }
            # Filter out None values before calculating AQI
            valid_current_pollutants = {k: v for k, v in current_pollutants.items() if v is not None}
            if valid_current_pollutants:
                aqi_result = measure_aqi(valid_current_pollutants)
                current_aqi_value = aqi_result.get("AQI")
                if current_aqi_value is not None:
                    total_calculated_aqi += current_aqi_value
                    valid_aqi_rows += 1

            # Accumulate current PM2.5 for averaging
            current_pm25 = row.pm25_current
            if current_pm25 is not None:
                total_pm25 += current_pm25
                valid_pm25_rows += 1

            # --- Prepare for Trend Calculation ---
            yesterday_pollutants = {
                "pm2.5": row.pm25_yesterday, "pm10": row.pm10_yesterday,
                "o3": row.o3_yesterday, "no2": row.no2_yesterday,
                "so2": row.so2_yesterday, "co": row.co_yesterday
            }
            valid_yesterday_pollutants = {k: v for k, v in yesterday_pollutants.items() if v is not None}
            yesterday_aqi_value = None
            if valid_yesterday_pollutants:
                 aqi_yesterday_result = measure_aqi(valid_yesterday_pollutants)
                 yesterday_aqi_value = aqi_yesterday_result.get("AQI")

            yesterday_pm25 = row.pm25_yesterday

            # Accumulate yesterday values only if both current and yesterday are valid for trend
            if current_aqi_value is not None and yesterday_aqi_value is not None and current_pm25 is not None and yesterday_pm25 is not None:
                 total_calculated_aqi_yesterday += yesterday_aqi_value
                 total_pm25_yesterday += yesterday_pm25
                 valid_trend_rows += 1


        if row_count == 0: # Should be caught by 'if not result' but good practice
             return {"current_aqi": 0, "pm25_level": 0, "aqi_trend_pct": 0, "pm25_trend_pct": 0, "monitoring_stations": 0, "alerts_today": 0}

        # --- Calculate Averages and Trends ---
        avg_aqi = round(total_calculated_aqi / valid_aqi_rows, 1) if valid_aqi_rows > 0 else 0
        avg_pm25 = round(total_pm25 / valid_pm25_rows, 1) if valid_pm25_rows > 0 else 0

        avg_aqi_trend = 0
        avg_pm25_trend = 0
        if valid_trend_rows > 0:
            avg_aqi_yesterday = total_calculated_aqi_yesterday / valid_trend_rows
            avg_pm25_yesterday = total_pm25_yesterday / valid_trend_rows
            # Calculate percentage change: ((current_avg - yesterday_avg) / yesterday_avg) * 100
            if avg_aqi_yesterday != 0:
                 avg_aqi_trend = round(((avg_aqi - avg_aqi_yesterday) / avg_aqi_yesterday) * 100, 1)
            if avg_pm25_yesterday != 0:
                 avg_pm25_trend = round(((avg_pm25 - avg_pm25_yesterday) / avg_pm25_yesterday) * 100, 1)


        # Return the aggregated public stats
        return {
            "current_aqi": avg_aqi,
            "pm25_level": avg_pm25,
            "aqi_trend_pct": avg_aqi_trend,
            "pm25_trend_pct": avg_pm25_trend,
            "monitoring_stations": total_stations, # Still relies on view providing correct sum per row
            "alerts_today": total_alerts
        }

    except Exception as e:
        import traceback
        print(f"Error in get_public_summary_stats_handler: {str(e)}")
        print(traceback.format_exc())

        # Return default values in case of any error during processing
        return {
            "current_aqi": 0,
            "pm25_level": 0,
            "aqi_trend_pct": 0,
            "pm25_trend_pct": 0,
            "monitoring_stations": 0,
            "alerts_today": 0
        }


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
from .utils import format_hourly_measurement_data, measure_aqi, format_forecast_data,format_map_data

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
        else:
            # If no organization_id is provided, filter by public organizations
            query += " WHERE role = 'public'"
            
        result = db.execute(text(query), params).fetchall()
        
        # Format the data using the utils module
        try:
            formatted_data = format_hourly_measurement_data(result)
        except Exception as format_error:
            print(f"Warning: Error in format_hourly_measurement_data: {str(format_error)}")
        
        
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
        else:
            # If no organization_id is provided, filter by public organizations
            query += " WHERE organization_role = 'public'"
            
        result = db.execute(text(query), params)
        rows = result.fetchall()
        
        formatted_data = []
        return format_map_data(rows)
        
    except Exception as e:
        print(f"Error in get_map_data_handler: {str(e)}")
        return []


def get_summary_stats_handler(db: Session, organization_id: Optional[int] = None):
    """
    Simplified function to retrieve air quality summary statistics for dashboard.
    If organization_id is provided, returns stats for that organization.
    Otherwise returns aggregated stats for all public organizations.
    """
    try:
        # Build the query based on whether we're filtering by organization
        if organization_id is not None:
            query = """
                SELECT 
                    pm25_current, pm10_current, o3_current, no2_current, so2_current, co_current,
                    pm25_previous, pm10_previous, o3_previous, no2_previous, so2_previous, co_previous,
                    monitoring_stations, alerts_today
                FROM dashboard_summary_stats_view
                WHERE organization_id = :organization_id
            """
            params = {"organization_id": organization_id}
        else:
            query = """
                SELECT 
                    pm25_current, pm10_current, o3_current, no2_current, so2_current, co_current,
                    pm25_previous, pm10_previous, o3_previous, no2_previous, so2_previous, co_previous,
                    monitoring_stations, alerts_today
                FROM dashboard_summary_stats_view
                WHERE role = 'public'
            """
            params = {}
        
        # Execute query
        result = db.execute(text(query), params).fetchall()
        
        if not result:
            # Return default values if no data found
            return {
                "current_aqi": 0,
                "pm25_level": 0, 
                "aqi_trend_pct": 0,
                "pm25_trend_pct": 0,
                "monitoring_stations": 0, 
                "alerts_today": 0
            }
        
        # Process the results directly
        pm25_current_values = []
        pm25_previous_values = []
        current_pollutants_dict = {
            "pm2.5": [], "pm10": [], "o3": [], "no2": [], "so2": [], "co": []
        }
        previous_pollutants_dict = {
            "pm2.5": [], "pm10": [], "o3": [], "no2": [], "so2": [], "co": []
        }
        total_stations = 0
        total_alerts = 0
        
        for row in result:
            # Collect stations and alerts
            total_stations += row.monitoring_stations or 0
            total_alerts += row.alerts_today or 0
            
            # Collect PM2.5 values for direct display
            if row.pm25_current is not None:
                pm25_current_values.append(row.pm25_current)
            if row.pm25_previous is not None:
                pm25_previous_values.append(row.pm25_previous)
            
            # Collect all pollutants for AQI calculation
            pollutant_map = {
                "pm2.5": row.pm25_current, "pm10": row.pm10_current, 
                "o3": row.o3_current, "no2": row.no2_current, 
                "so2": row.so2_current, "co": row.co_current
            }
            
            previous_pollutant_map = {
                "pm2.5": row.pm25_previous, "pm10": row.pm10_previous, 
                "o3": row.o3_previous, "no2": row.no2_previous, 
                "so2": row.so2_previous, "co": row.co_previous
            }
            
            for pollutant, value in pollutant_map.items():
                if value is not None:
                    current_pollutants_dict[pollutant].append(value)
            
            for pollutant, value in previous_pollutant_map.items():
                if value is not None:
                    previous_pollutants_dict[pollutant].append(value)
        
        # Calculate PM2.5 average and trend
        if pm25_current_values:
            avg_pm25 = round(sum(pm25_current_values) / len(pm25_current_values), 1) # will be rounded to one decimal place.
        else:
            avg_pm25 = 0
        
        # Calculate average for each pollutant for AQI calculation
        current_pollutants_avg = {}
        previous_pollutants_avg = {}
        
        for pollutant, values in current_pollutants_dict.items():
            if values:
                current_pollutants_avg[pollutant] = sum(values) / len(values)
        
        for pollutant, values in previous_pollutants_dict.items():
            if values:
                previous_pollutants_avg[pollutant] = sum(values) / len(values)
        
        # Calculate AQI from averages
        current_aqi = 0
        previous_aqi = 0
        
        if current_pollutants_avg:
            aqi_result = measure_aqi(current_pollutants_avg)
            print(f"aqi_result AQI result: {aqi_result}")
            current_aqi = round(aqi_result.get("AQI", 0))
        
        if previous_pollutants_avg:
            previous_aqi_result = measure_aqi(previous_pollutants_avg)
            print(f"Previous AQI result: {previous_aqi_result}")
            previous_aqi = previous_aqi_result.get("AQI", 0)
        
        # Calculate trends
        aqi_trend_pct = 0
        pm25_trend_pct = 0
        
        if previous_aqi > 0:
            aqi_trend_pct = round(((current_aqi - previous_aqi) / previous_aqi) * 100, 1)
        
        if pm25_previous_values:
            avg_pm25_previous = sum(pm25_previous_values) / len(pm25_previous_values)
            if avg_pm25_previous > 0:
                pm25_trend_pct = round(((avg_pm25 - avg_pm25_previous) / avg_pm25_previous) * 100, 1)
        
        # Return the dashboard data
        return {
            "current_aqi": current_aqi,
            "pm25_level": avg_pm25,
            "aqi_trend_pct": aqi_trend_pct,
            "pm25_trend_pct": pm25_trend_pct,
            "monitoring_stations": total_stations,
            "alerts_today": total_alerts
        }
        
    except Exception as e:
        print(f"Error in get_summary_stats_handler: {str(e)}")
        
        # Return default values in case of error
        return {
            "current_aqi": 0,
            "pm25_level": 0, 
            "aqi_trend_pct": 0,
            "pm25_trend_pct": 0,
            "monitoring_stations": 0, 
            "alerts_today": 0
        }


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
        else:
            # If no organization_id is provided, filter by public organizations
            query += " WHERE role = 'public'"
            
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


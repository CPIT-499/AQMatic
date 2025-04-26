import pandas as pd
from src.db.connect import db_cursor

def get_measurements(org_id: int, attr_id: int):
    """Get historical measurements for a specific organization and attribute"""
    with db_cursor() as cur:
        if cur is None:
            return None
            
        # Get historical data
        cur.execute("""
            SELECT measurement_time::date, value
            FROM measurements
            WHERE organization_id = %s
              AND attribute_id = %s
            ORDER BY measurement_time
        """, (org_id, attr_id))
        return cur.fetchall()

def get_recent_forecasts(org_id: int, attr_id: int):
    """Get recent forecasts for display"""
    with db_cursor() as cur:
        if cur is None:
            return []
            
        # Get recent forecasts
        cur.execute("""
            SELECT target_time, predicted_value
            FROM forecasts
            WHERE organization_id = %s
              AND attribute_id = %s
              AND horizon_days = 7
            ORDER BY target_time
            LIMIT 7
        """, (org_id, attr_id))
        return cur.fetchall()
    
    
    
    
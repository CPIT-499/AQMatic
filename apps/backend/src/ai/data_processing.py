"""
Data processing module for AQMatic forecasting.

This module contains functions for preprocessing time series data 
for air quality forecasting models.
"""

import numpy as np
import pandas as pd
import os
from datetime import datetime, timedelta
from sklearn.preprocessing import RobustScaler
from src.db.select_data import get_measurements

def preprocess_data(org_id, attr_id):
    """
    Preprocess historical measurements data for forecasting.
    
    Args:
        org_id: Organization ID
        attr_id: Attribute ID to forecast
        
    Returns:
        Tuple of (dataframe, scaled_data, scaler) or (None, None, None) if data is insufficient
    """
    print(f"STEP 1: Loading data for organization {org_id} and attribute {attr_id}")
    # ========================================================= GET DATA ========================================================= 
 
    rows = get_measurements(org_id, attr_id)
    if not rows:
        print(f"STEP 1: No data found for organization {org_id} and attribute {attr_id}")
        return None, None, None
    
    print(f"STEP 1: Retrieved {len(rows)} measurements")
    # ========================================================= GET DATA ========================================================= 
    
    # ========================================================= PROCESS DATA =========================================================
    # Convert rows to DataFrame
    
    df = pd.DataFrame(rows, columns=["dt", "value"])
    
    print(f"STEP 2: Processing and cleaning data")
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    df = df.dropna(subset=['value'])
    
    if df.empty:
        print(f"STEP 2: No valid numeric data found")
        return None, None, None
    
    df['dt'] = pd.to_datetime(df['dt'])
    df = df.set_index("dt")
    
    df = df.astype({'value': 'float64'})  # Ensure 'value' is float
    # ========================================================= SAMPLING =========================================================
    # Check if data is already daily
    
    # Check if we need daily resampling (if data is not already daily)
    needs_resampling = df.index.to_series().diff().dt.days.mean() > 1 or df.index.has_duplicates
    
    if needs_resampling:
        print(f"STEP 3: Resampling data to daily frequency")
        # Resample to daily frequency since data is irregular or has duplicates
        df = df.resample("D").first()
    
    # Only interpolate if there are missing values
    missing_values = df['value'].isna().sum()
    
    if missing_values > 0:
        print(f"STEP 4: Interpolating {missing_values} missing values")
        df = df.interpolate(method="time").ffill().bfill()
    
    print(f"STEP 5: Normalizing data")
    # Prepare data
    series = df["value"].values.reshape(-1,1)
    #=========================================================== SAMPLING =========================================================
    
    # \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    # ========================================================== NORMALIZING =========================================================
    # Normalize data using RobustScaler to reduce the influence of outliers
    scaler = RobustScaler()  # RobustScaler is less sensitive to outliers
    scaled = scaler.fit_transform(series)
    print(f"STEP 5: Data normalized from range [{series.min():.2f}, {series.max():.2f}] to [{scaled.min():.2f}, {scaled.max():.2f}]")
    
    return df, scaled, scaler
    # =========================================================== NORMALIZING =========================================================
    
    

#\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

# =========================================================== make_windows========================================================
# Create sliding windows for LSTM training
def make_windows(arr, T_in, Tout=7):
    """
    Create sliding windows for LSTM training.
    
    Args:
        arr: Array of data points
        T_in: Input window size
        Tout: Output window size (default: 7 days)
        
    Returns:
        X, y arrays for training
        
    Why:
        Sliding windows transform time series data into supervised learning format
        where each window of historical data (X) is used to predict the next 
        sequence of values (y). This approach enables LSTMs to learn temporal
        patterns and dependencies from historical measurements.
    """
    X, y = [], []
    for i in range(len(arr) - T_in - Tout + 1):
        X.append(arr[i:i+T_in])
        y.append(arr[i+T_in:i+T_in+Tout])
    return np.array(X), np.array(y)

# =========================================================== get_model_path ========================================================
# Get the path to save or load model
# This function is used to determine where to save the model file based on the environment (Docker or local)
def get_model_path(org_id, attr_id):
    """
    Get the path to save or load model.
    
    Args:
        org_id: Organization ID
        attr_id: Attribute ID
        
    Returns:
        Path to the model file
    """
    # Try environment-based path first (for Docker), fall back to local path
    model_base_dir = os.environ.get('MODEL_DIR', '/opt/airflow/models')
    
    # Create alternative paths if running locally
    if not os.path.exists(model_base_dir):
        # Use relative path from current file
        model_base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
        
    # Create directory if it doesn't exist
    os.makedirs(model_base_dir, exist_ok=True)
    model_path = os.path.join(model_base_dir, f"lstm_org{org_id}_attr{attr_id}.h5")
    
    return model_path

# =========================================================== create_forecast_rows ========================================================

# Create forecast rows for database insertion
# This function prepares the forecast data for insertion into the database

def create_forecast_rows(preds, last_date, org_id, attr_id):
    """
    Create database rows for forecasted values.
    
    Args:
        preds: Model predictions
        last_date: Last date in the training data
        org_id: Organization ID
        attr_id: Attribute ID
        
    Returns:
        List of forecast row tuples ready for database insertion
    """
    now = datetime.utcnow()
    forecast_rows = []
    
    for day in range(1, 8):
        target = last_date + timedelta(days=day)
        forecast_rows.append((
            org_id,
            attr_id, 
            7,            # horizon_days
            now,          # forecast_time
            target,       # target_time
            float(preds[day-1])
        ))
    
    return forecast_rows
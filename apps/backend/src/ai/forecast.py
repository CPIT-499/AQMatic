import os
from tensorflow.keras.models import load_model
from src.db.insert_data import insert_forecasts
from src.db.select_data import get_measurements
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
from datetime import datetime, timedelta

def load_model_from_path(org_id: int, attr_id: int):
    """Load and return the trained model for the given organization and attribute."""

    # Set up model path
    model_base_dir = os.environ.get('MODEL_DIR', '/opt/airflow/models')
    
    # Use relative path if needed
    if not os.path.exists(model_base_dir):
        model_base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
    
    os.makedirs(model_base_dir, exist_ok=True)
    model_path = os.path.join(model_base_dir, f"lstm_org{org_id}_attr{attr_id}.h5")
    
    
    
    # Load and return model
    print(f"Loading saved model from {model_path}")
    return load_model(model_path)

def forecast_and_store_results(org_id: int, attr_id: int):

    # Load the saved model
    model = load_model_from_path(org_id, attr_id)
    
    # Fixed window size
    window_size = 14
    # Preprocess data
    df, scaled, scaler = preprocess_data(org_id, attr_id)
    
    # Check if preprocessing was successful
    if df is None or scaled is None or scaler is None:
        print(f"Cannot generate forecast: insufficient data for org_id={org_id}, attr_id={attr_id}")
        return False
    
    # Check if we have enough data for prediction window
    if len(scaled) < window_size:
        print(f"Not enough data for forecasting. Need at least {window_size} days, have {len(scaled)}")
        return False
    
    # Make predictions
    last_window_data = scaled[-window_size:].reshape(1, window_size, 1) # Reshape for LSTM input

    preds_scaled = model.predict(last_window_data, verbose=0) 
    # result is 7 days of scaled data preds 
    preds = scaler.inverse_transform(preds_scaled.reshape(-1,1)).flatten()  # result is 7 days of scaled data preds 
    
    # Create and store forecast rows
    forecast_rows = create_forecast_rows(preds, df.index[-1], org_id, attr_id)

    return insert_forecasts(forecast_rows)



def preprocess_data(org_id, attr_id):
    """Preprocess historical measurements data for forecasting."""
    # Get data from the database
    rows = get_measurements(org_id, attr_id)
    
    # Check if we have data
    if not rows:
        print(f"No data found for org_id={org_id}, attr_id={attr_id}")
        return None, None, None
    
    # Create DataFrame and clean
    df = pd.DataFrame(rows, columns=["dt", "value"])
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    df = df.dropna(subset=['value'])
    # Check if we still have data after cleaning
    if len(df) == 0:
        print(f"No valid data remains after cleaning for org_id={org_id}, attr_id={attr_id}")
        return None, None, None
    


    # to insure data is sorted by date
    df['dt'] = pd.to_datetime(df['dt'])
    df = df.set_index("dt")
    df = df.resample("D").first()  # Resample data to daily frequency
    
    # 
    df['value'] = df['value'].interpolate(method="time")



    # Scale data
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(df["value"].values.reshape(-1, 1))  # 2d for MinMaxScaler
    
    return df, scaled_data, scaler

def create_forecast_rows(preds, last_date, org_id, attr_id):

    now = datetime.utcnow()
    forecast_rows = []
    
    for day in range(1, 8):
        target = last_date + timedelta(days=day)
        forecast_rows.append((
            org_id, attr_id, 7, now, target, float(preds[day-1])
        ))
    
    return forecast_rows

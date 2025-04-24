import numpy as np
import pandas as pd
from datetime import datetime, timedelta, date
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dropout, Dense
from src.db.select_data import get_measurements, get_recent_forecasts
from src.db.insert_data import insert_forecasts


def forecast_next_week_and_store(org_id: int, attr_id: int, T_in: int = 7, **kwargs):
    """
    Forecast the next 7 days of air quality using LSTM and store results.
    
    Args:
        org_id: Organization ID
        attr_id: Attribute ID to forecast
        T_in: Input time window for the LSTM model (default: 7 days)
    """
    # Get historical measurements and prepare data
    rows = get_measurements(org_id, attr_id)
    if not rows:
        print(f"No data found for organization {org_id} and attribute {attr_id}")
        return
        
    # Convert to DataFrame and prepare
    df = pd.DataFrame(rows, columns=["dt", "value"])
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    df = df.dropna(subset=['value'])
    
    if df.empty:
        print(f"No valid numeric data found for organization {org_id} and attribute {attr_id}")
        return
    
    df['dt'] = pd.to_datetime(df['dt'])
    df = df.set_index("dt")
    
    # Resample to daily data
    df = df.astype({'value': 'float64'})
    df = df.resample("D").first().interpolate(method="time").ffill().bfill()
    
    # Validate data for training
    series = df["value"].values.reshape(-1,1)
    if len(series) < T_in + 7:
        print(f"Insufficient data for forecasting. Need {T_in + 7} days, have {len(series)}")
        return

    # Scale data for LSTM
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(series)

    # Create windows for training
    X, y = make_windows(scaled, T_in)
    
    # Build & train LSTM model
    model = build_lstm_model(T_in)
    model.fit(X, y.reshape(y.shape[0], 7), epochs=10, batch_size=8, verbose=0)
    
    # Make predictions
    last_window = X[-1:]
    preds_scaled = model.predict(last_window)
    preds = scaler.inverse_transform(preds_scaled.reshape(-1,1)).flatten()
    
    # Prepare forecast rows
    forecast_rows = create_forecast_rows(preds, df.index[-1], org_id, attr_id)
    
    # Store and display results
    if insert_forecasts(forecast_rows):
        forecasts = get_recent_forecasts(org_id, attr_id)
        display_forecasts(forecasts, org_id, attr_id)


def make_windows(arr, T_in, Tout=7):
    """Create sliding windows for LSTM training"""
    X, y = [], []
    for i in range(len(arr) - T_in - Tout + 1):
        X.append(arr[i:i+T_in])
        y.append(arr[i+T_in:i+T_in+Tout])
    return np.array(X), np.array(y)


def build_lstm_model(T_in):
    """Build LSTM model architecture"""
    model = Sequential([
        LSTM(32, return_sequences=True, input_shape=(T_in,1)),
        Dropout(0.2),
        LSTM(16),
        Dense(7)
    ])
    model.compile(optimizer="adam", loss="mse")
    return model


def create_forecast_rows(preds, last_date, org_id, attr_id):
    """Create database rows for forecasted values"""
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


def display_forecasts(forecasts, org_id, attr_id):
    """Display forecasted values"""
    print(f"Next‑7‑day forecast for org {org_id}, attribute {attr_id}:")
    for target_time, value in forecasts:
        # Handle both datetime and date objects
        display_date = target_time
        if hasattr(target_time, 'date'):
            display_date = target_time.date()
        print(f"  {display_date} → {value:.2f}")
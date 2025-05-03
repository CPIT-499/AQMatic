import numpy as np
import pandas as pd
from datetime import datetime, timedelta, date
from sklearn.preprocessing import RobustScaler
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
    print(f"Starting forecast for org_id={org_id}, attr_id={attr_id}, T_in={T_in}")
    
    ########### GET DATA ###########
    # Get historical measurements and prepare data
    rows = get_measurements(org_id, attr_id)
    if not rows:
        print(f"No data found for organization {org_id} and attribute {attr_id}")
        return
    
    print(f"Retrieved {len(rows)} raw measurements")
        
    # Convert to DataFrame and prepare
    df = pd.DataFrame(rows, columns=["dt", "value"])
    print(f"Raw DataFrame shape: {df.shape}")
    print(f"Raw DataFrame head:\n{df.head().to_string()}")
    
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    df = df.dropna(subset=['value'])
    print(f"After numeric conversion and NA drop: {df.shape}")
    
    if df.empty:
        print(f"No valid numeric data found for organization {org_id} and attribute {attr_id}")
        return
    
    df['dt'] = pd.to_datetime(df['dt'])
    df = df.set_index("dt")
    
    df = df.astype({'value': 'float64'})  # Ensure 'value' is float
    print(f"DataFrame after datetime conversion:\n{df.head().to_string()}")
    print(f"Data types: {df.dtypes}")
    
    ######## PREPROCESSING ########
    
    # Check if we need daily resampling (if data is not already daily)
    needs_resampling = df.index.to_series().diff().dt.days.mean() > 1 or df.index.has_duplicates
    print(f"Average days between samples: {df.index.to_series().diff().dt.days.mean():.2f}")
    print(f"Has duplicates: {df.index.has_duplicates}")
    print(f"Needs resampling: {needs_resampling}")
    
    if needs_resampling:
        # Resample to daily frequency since data is irregular or has duplicates
        df = df.resample("D").first()
        print(f"After resampling: {df.shape}")
        print(f"DataFrame after resampling:\n{df.head().to_string()}")
    
    # Only interpolate if there are missing values
    missing_values = df['value'].isna().sum()
    print(f"Missing values: {missing_values}")
    
    if missing_values > 0:
        df = df.interpolate(method="time").ffill().bfill()
        print(f"After interpolation: {df.shape}")
        print(f"Missing values after interpolation: {df['value'].isna().sum()}")
    
    # Validate at least  7 days of data
    series = df["value"].values.reshape(-1,1)
    print(f"Series shape after reshape: {series.shape}")
    
    if len(series) < T_in + 7:
        print(f"Insufficient data for forecasting. Need {T_in + 7} days, have {len(series)}")
        return
   
    # Normalize the data 
    scaler = RobustScaler()  # RobustScaler is less sensitive to outliers
    scaled = scaler.fit_transform(series)
    print(f"Data range before scaling: [{series.min():.2f}, {series.max():.2f}]")
    print(f"Data range after scaling: [{scaled.min():.2f}, {scaled.max():.2f}]")

    # Create windows for training
    X, y = make_windows(scaled, T_in)
    print(f"Training data shapes: X={X.shape}, y={y.shape}")
    
    # Build & train LSTM model
    model = build_lstm_model(T_in)
    print(f"Starting model training with {len(X)} examples")
    history = model.fit(X, y.reshape(y.shape[0], 7), epochs=10, batch_size=8, verbose=0)
    print(f"Model training complete. Final loss: {history.history['loss'][-1]:.4f}")
    
    # Make predictions
    last_window = X[-1:]
    print(f"Predicting with last window shape: {last_window.shape}")
    preds_scaled = model.predict(last_window)
    preds = scaler.inverse_transform(preds_scaled.reshape(-1,1)).flatten()
    print(f"Predictions (unscaled): {preds}")
    
    # Prepare forecast rows
    forecast_rows = create_forecast_rows(preds, df.index[-1], org_id, attr_id)
    print(f"Created {len(forecast_rows)} forecast rows")
    
    # Store and display results
    insert_success = insert_forecasts(forecast_rows)
    print(f"Forecast insertion {'successful' if insert_success else 'failed'}")
    
    if insert_success:
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
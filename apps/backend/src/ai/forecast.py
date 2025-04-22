import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dropout, Dense
from src.db.connect import connect_to_db


def forecast_next_week_and_store(org_id: int, attr_id: int, T_in: int = 30, **kwargs):
    """
    Forecast the next 7 days of an air quality attribute value using LSTM and store in database.
    
    Args:
        org_id: Organization ID
        attr_id: Attribute ID to forecast
        T_in: Input time window for the LSTM model (default: 30 days)
    """
    # ——————————————
    # 0) Database connection
    conn = connect_to_db()
    if conn is None:
        print("Failed to connect to the database")
        return
    
    cur = conn.cursor()

    # ——————————————
    # 1) Extract ALL available history for this gas
    cur.execute("""
        SELECT measurement_time::date, value
        FROM measurements
        WHERE organization_id = %s
          AND attribute_id    = %s
        ORDER BY measurement_time
    """, (org_id, attr_id))
    rows = cur.fetchall()
    
    if not rows:
        print(f"No data found for organization {org_id} and attribute {attr_id}")
        cur.close()
        conn.close()
        return
        
    # Convert to DataFrame and ensure the 'dt' column is parsed as datetime
    df = pd.DataFrame(rows, columns=["dt", "value"])
    
    # Explicitly convert value column to float to ensure numeric data type
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    
    # Drop rows where conversion to numeric failed
    df = df.dropna(subset=['value'])
    
    if df.empty:
        print(f"No valid numeric data found for organization {org_id} and attribute {attr_id}")
        cur.close()
        conn.close()
        return
    
    # Convert 'dt' column to datetime before setting it as index
    df['dt'] = pd.to_datetime(df['dt'])
    df = df.set_index("dt")

    # ——————————————
    # 2) Resample to daily and fill gaps - ensure the value column is float type first
    df = df.astype({'value': 'float64'})  # Explicitly convert to float64 before resampling
    
    df = (
        df
        .resample("D").mean()
        .interpolate(method="time")
        .ffill().bfill()
    )
    
    # Verify data types before proceeding
    print(f"DataFrame dtypes after processing: {df.dtypes}")
    
    # Double check the data type and handle any remaining conversion issues
    if not pd.api.types.is_numeric_dtype(df['value']):
        print("Warning: Value column is still not numeric after conversion, forcing conversion")
        df['value'] = df['value'].astype('float64')
    
    series = df["value"].values.reshape(-1,1)  # shape (L,1)

    # Check if we have enough data for training
    if len(series) < T_in + 7:
        print(f"Not enough data for forecasting. Need at least {T_in + 7} days, but got {len(series)}")
        cur.close()
        conn.close()
        return

    # ——————————————
    # 3) Scale
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(series)      # shape (L,1)

    # ——————————————
    # 4) Window into (T_in → 7‑day out)
    def make_windows(arr, Tin, Tout=7):
        X, y = [], []
        for i in range(len(arr) - Tin - Tout + 1):
            X.append(arr[i:i+Tin])
            y.append(arr[i+Tin:i+Tin+Tout])
        return np.array(X), np.array(y)

    X, y = make_windows(scaled, T_in, Tout=7)
    # X.shape = (samples, T_in, 1), y.shape = (samples, 7, 1)

    # ——————————————
    # 5) Build & train the univariate LSTM
    model = Sequential([
        LSTM(32, return_sequences=True, input_shape=(T_in,1)),
        Dropout(0.2),
        LSTM(16),
        Dense(7)      # exactly next‑7‑days
    ])
    model.compile(optimizer="adam", loss="mse")
    model.fit(X, y.reshape(y.shape[0],7), epochs=10, batch_size=8, verbose=0)

    # ——————————————
    # 6) Predict from the last window
    last_window = X[-1:]                      # shape (1,T_in,1)
    preds_scaled = model.predict(last_window) # shape (1,7)
    preds = scaler.inverse_transform(         # back to real units
        preds_scaled.reshape(-1,1)
    ).flatten()                               # array of length 7

    # ——————————————
    # 7) Build forecast rows for insertion
    now = datetime.utcnow()
    last_date = df.index[-1]
    forecast_rows = []
    for day in range(1, 8):                   # 1…7
        target = last_date + timedelta(days=day)
        forecast_rows.append((
            org_id,        # organization_id
            attr_id,       # attribute_id
            7,             # horizon_days = 7
            now,           # forecast_time
            target,        # target_time
            float(preds[day-1])
        ))

    # ——————————————
    # 8) Insert into forecasts table
    try:
        insert_sql = """
          INSERT INTO forecasts
            (organization_id, attribute_id, horizon_days,
             forecast_time, target_time, predicted_value)
          VALUES (%s,%s,%s,%s,%s,%s)
          ON CONFLICT (organization_id, attribute_id, horizon_days, target_time)
          DO UPDATE SET 
             forecast_time = EXCLUDED.forecast_time,
             predicted_value = EXCLUDED.predicted_value
        """
        cur.executemany(insert_sql, forecast_rows)
        conn.commit()

        # ——————————————
        # 9) Fetch & print what we just inserted
        cur.execute("""
          SELECT target_time, predicted_value
          FROM forecasts
          WHERE organization_id=%s
            AND attribute_id=%s
            AND horizon_days=7
          ORDER BY target_time
          LIMIT 7
        """, (org_id, attr_id))

        print(f"Next‑7‑day forecast for org {org_id}, attribute {attr_id}:")
        for target_time, value in cur.fetchall():
            print(f"  {target_time.date()} → {value:.2f}")
    except Exception as e:
        print(f"Error storing forecasts: {e}")
        conn.rollback()
    finally:
        # ——————————————
        # 10) Clean up
        cur.close()
        conn.close()
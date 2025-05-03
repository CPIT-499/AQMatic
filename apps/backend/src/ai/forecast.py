"""
Forecasting module for AQMatic air quality prediction.

This module contains functions for building, training, and using LSTM models
to forecast air quality metrics.
"""

import os
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dropout, Dense
from src.db.select_data import get_recent_forecasts
from src.db.insert_data import insert_forecasts
from src.ai.data_processing import (
    preprocess_data, 
    make_windows, 
    get_model_path,
    create_forecast_rows
)




# ================================================= build_and_train_model ==================================================
def build_and_train_model(scaled_data, T_in, epochs=10):
    """
    Build and train LSTM model for air quality forecasting.
    
    Args:
        scaled_data: Normalized time series data
        T_in: Input time window size for the LSTM
        epochs: Number of training epochs
        
    Returns:
        Trained Keras model
    """
    # Create windows for training
    X, y = make_windows(scaled_data, T_in)
    print(f"STEP 6: Created training data with {len(X)} examples, X shape={X.shape}, y shape={y.shape}")
    
    # Build LSTM model
    model = Sequential([
        LSTM(32, return_sequences=True, input_shape=(T_in,1)),
        Dropout(0.2),
        LSTM(16),
        Dense(7)
    ])
    model.compile(optimizer="adam", loss="mse")
    
    # Train model
    print(f"STEP 7: Training model with epochs={epochs}, batch_size=8")
    history = model.fit(X, y.reshape(y.shape[0], 7), epochs=epochs, batch_size=8, verbose=0)
    print(f"STEP 7: Model training complete. Final loss: {history.history['loss'][-1]:.4f}")
    
    return model
# ==========================================================================================================================
def display_forecasts(forecasts, org_id, attr_id):
    """
    Display forecasted values in a readable format.
    
    Args:
        forecasts: List of forecast tuples from the database
        org_id: Organization ID
        attr_id: Attribute ID
    """
    print(f"STEP 10: Next‑7‑day forecast for org {org_id}, attribute {attr_id}:")
    for target_time, value in forecasts:
        # Handle both datetime and date objects
        display_date = target_time
        if hasattr(target_time, 'date'):
            display_date = target_time.date()
        print(f"        {display_date} → {value:.2f}")







# ======================================================== forecast_next_week_and_store ========================================================
def forecast_next_week_and_store(org_id: int, attr_id: int, T_in: int = 14, use_saved_model: bool = True, epochs: int = 20, **kwargs):
    """
    Forecast the next 7 days of air quality using LSTM and store results.
    Args:
        org_id: Organization ID
        attr_id: Attribute ID to forecast
        T_in: Input time window for the LSTM model (default: 14 days)
        use_saved_model: Whether to load a saved model instead of training (default: True)
        epochs: Number of training epochs (default: 20)
    """
    print(f"STEP 0: Starting forecast for org_id={org_id}, attr_id={attr_id}")
    # ======================================================== 
    # Preprocess data 
    df, scaled, scaler = preprocess_data(org_id, attr_id)
    if df is None or scaled is None:
        print("STEP 0: Data preprocessing failed, stopping forecast")
        return
    # ======================================================== 
    
    
    
    # Validate we have enough data for the requested window
    if len(scaled) < T_in + 7:
        print(f"STEP 0: Insufficient data for forecasting. Need at least {T_in + 7} days, have {len(scaled)}")
        return
   # ======================================================== Model loading ========================================================= 
    # Get model path
    model_path = get_model_path(org_id, attr_id)
    
    model_input_size = T_in  # Default to the requested T_in
    
    if use_saved_model and os.path.exists(model_path):
        print(f"STEP 6: Loading saved model from {model_path}")
        # Load existing model
        model = load_model(model_path)
        
        # Get the input shape from the loaded model
        model_input_shape = model.input_shape
        if model_input_shape and len(model_input_shape) == 3:
            model_input_size = model_input_shape[1]
            
            # If the model expects a different window size than what was requested
            if model_input_size != T_in:
                print(f"STEP 6: Model requires window size {model_input_size} (adjusted from requested {T_in})")
                # Adjust T_in to match the model's expected input size
                T_in = model_input_size
    # ======================================================== Model loading ========================================================= 
    else:
        # ========================================================= if no saved model========================================================= 
        # Train new model
        model = build_and_train_model(scaled, T_in, epochs)
        
        # Save the model
        model.save(model_path)
        print(f"STEP 8: Model saved to {model_path}")
    # ========================================================= if no saved model ========================================================= 
    
    # ========================================================= Make predictions ========================================================= 
    
    
    # Make sure we have enough data for the window size required by the model
    if len(scaled) < T_in + 7:
        print(f"STEP 8: Insufficient data for forecasting with window size {T_in}")
        return
        
    # Prepare data for prediction - use the adjusted T_in value if model required it
    last_window_data = scaled[-T_in:].reshape(1, T_in, 1)
    
    # Make predictions
    print(f"STEP 9: Generating predictions for next 7 days")
    preds_scaled = model.predict(last_window_data, verbose=0)
    preds = scaler.inverse_transform(preds_scaled.reshape(-1,1)).flatten()
    
    # Prepare forecast rows
    forecast_rows = create_forecast_rows(preds, df.index[-1], org_id, attr_id)
    print(f"STEP 9: Created {len(forecast_rows)} forecast rows")
    
    # Store and display results
    insert_success = insert_forecasts(forecast_rows)
    print(f"STEP 10: Forecast insertion {'successful' if insert_success else 'failed'}")
    
    if insert_success:
        forecasts = get_recent_forecasts(org_id, attr_id)
        display_forecasts(forecasts, org_id, attr_id)
# ========================================================= Make predictions =========================================================

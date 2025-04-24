# Air Quality Forecasting System

## Overview
This module provides a 7-day air quality forecasting system for AQMatic. It uses historical measurement data to predict future air quality values for various attributes (PM2.5, NO2, etc.) using a Long Short-Term Memory (LSTM) neural network. The system retrieves historical data, trains the model, generates predictions, validates them for reasonableness, and stores them in the database.

## Why LSTM?
We use LSTM (Long Short-Term Memory) neural networks for the following reasons:

1. **Temporal Pattern Recognition**: LSTMs excel at capturing time-dependent patterns in air quality data, including daily and weekly cycles.
2. **Memory Capability**: Unlike simple models, LSTMs can "remember" important patterns from days or weeks ago.
3. **Noise Resistance**: Air quality data often contains noise and outliers; LSTMs can learn to distinguish meaningful signals from anomalies.
4. **Multi-step Forecasting**: Our implementation directly predicts all 7 future days in one operation, maintaining temporal coherence.
5. **Non-linear Relationships**: Air quality depends on complex, non-linear factors that LSTMs can model effectively.

## Key Functions

- `forecast_next_week_and_store(org_id, attr_id, T_in=7)`: Main function that orchestrates the entire forecasting pipeline from data retrieval to storage.
- `make_windows(arr, T_in, Tout=7)`: Creates sliding windows for LSTM training from time series data.
- `build_lstm_model(T_in)`: Constructs the neural network architecture with LSTM layers.
- `create_forecast_rows(preds, last_date, org_id, attr_id)`: Formats predictions for database storage.
- `validate_forecast_reasonability(forecasts, df, attr_id)`: Ensures predictions fall within reasonable bounds based on historical patterns.
- `display_forecasts(forecasts, org_id, attr_id)`: Formats and displays prediction results.

The forecasting system stores its predictions in the database with:
- `forecast_time`: When the prediction was generated
- `target_time`: The future date being predicted
- `predicted_value`: The expected air quality value

Predictions are automatically updated daily to provide the most accurate 7-day forecast window.
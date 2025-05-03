# AI Module for AQMatic

## Preprocessing Methods

1. **Data Normalization (RobustScaler)**: 
   - Reduces the impact of outliers which are common in air quality data
   - Makes training more stable and efficient by bringing values to similar scale
   - RobustScaler specifically uses median and quantiles instead of mean/std, making it resistant to outliers

2. **Time Series Resampling**:
   - Ensures consistent daily frequency despite irregular measurement intervals
   - Fills gaps in the data stream for more reliable predictions

3. **Missing Value Interpolation**:
   - Uses time-based interpolation to handle gaps in measurements
   - Preserves temporal patterns instead of simple averaging

## Training Methods

1. **LSTM Architecture**:
   - Long Short-Term Memory networks excel at capturing temporal dependencies
   - Two-layer design with dropout for regularization helps prevent overfitting
   - Well-suited for time series forecasting with seasonal patterns

2. **Sliding Window Approach**:
   - Creates input-output pairs from continuous time series
   - Uses T_in days of history to predict next 7 days
   - Maximizes use of available training data

3. **Model Persistence**:
   - Saves trained models for reuse without retraining
   - Allows for incremental learning as new data arrives
   - Reduces computational overhead in production

The combined approach enables accurate 7-day air quality forecasts while efficiently handling the challenges of environmental time series data.
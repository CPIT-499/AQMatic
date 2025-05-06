import os
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from .forecast import preprocess_data

def get_model_path(org_id, attr_id):
    "Get the path where the model should be saved"
    
    model_base_dir = os.environ.get('MODEL_DIR', '/opt/airflow/models')
    if not os.path.exists(model_base_dir):
        
        model_base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
    os.makedirs(model_base_dir, exist_ok=True)
    return os.path.join(model_base_dir, f"lstm_org{org_id}_attr{attr_id}.h5")

def train_lstm_model(org_id, attr_id):
    """
    Train LSTM model for forecasting and save to disk.
    """
    # get data 
    df, scaled_data, scaler = preprocess_data(org_id, attr_id)
    
    # Create windows for training
    X, y = [], []
    window_size, horizon = 14, 7
    
    for i in range(len(scaled_data) - window_size - horizon + 1):
        X.append(scaled_data[i:i + window_size])
        y.append(scaled_data[i + window_size:i + window_size + horizon])
    
    
    # ---------------------------------------------
    
    X, y = np.array(X), np.array(y)
    split = int(len(X) * 0.8)
    X_train, y_train = X[:split], y[:split]
    X_val, y_val = X[split:], y[split:]
    # ---------------------------------------------
    
    # Build simplified LSTM model
    model = Sequential([
        LSTM(50, input_shape=(window_size, 1)),
        Dropout(0.2),
        Dense(horizon)
    ])
    model.compile(optimizer='adam', loss='mse')
    
    
    # Train model with early stopping
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=30,
        batch_size=32,
        callbacks=[EarlyStopping(patience=5, restore_best_weights=True)],
        verbose=1
    )
    
    # Get model path using helper function
    model_path = get_model_path(org_id, attr_id)
    # Save and return model path
    model.save(model_path)
    print(f"Model saved to: {model_path}")
    return model_path

"""
Model Retraining DAG for AQMatic Air Quality Forecasting

This DAG runs monthly to retrain air quality forecasting models.
It ensures that the models remain up-to-date with the latest data patterns.
"""

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.utils.task_group import TaskGroup
from datetime import datetime

import pendulum
from src.ai.forecast import forecast_next_week_and_store

# Define default arguments for the DAG
default_args = {
    'owner': 'airflow',
    'start_date': pendulum.today('UTC').add(days=-1),
    'retries': 2,
    'retry_delay': pendulum.duration(minutes=10),
    'email_on_failure': True,    # Optional: Set up email alerts for failures
    'email_on_retry': False,
}

# Create the monthly model retraining DAG
dag = DAG(
    'model_retraining_pipeline',
    default_args=default_args,
    description='Monthly pipeline for retraining forecast models',
    schedule='@monthly',  # Run once a month
    catchup=False,
    tags=['ai', 'model', 'training'],
)

with dag:
    # Define attribute IDs and their names - same as in data_pipeline.py
    attribute_configs = [
        {'attr_id': 1, 'name': 'temperature'},
        {'attr_id': 2, 'name': 'humidity'},
        {'attr_id': 3, 'name': 'co2'},
        {'attr_id': 4, 'name': 'pm2.5'},
        {'attr_id': 5, 'name': 'wind_speed'},
        {'attr_id': 6, 'name': 'pm10'},
        {'attr_id': 7, 'name': 'no2'},
        {'attr_id': 8, 'name': 'so2'},
        {'attr_id': 9, 'name': 'co'},
        {'attr_id': 10, 'name': 'o3'},
        {'attr_id': 11, 'name': 'methane'},
        {'attr_id': 12, 'name': 'nitrous_oxide'},
        {'attr_id': 13, 'name': 'fluorinated_gases'},
    ]
    
    # Create task groups for better organization
    with TaskGroup(group_id='model_training') as training_group:
        # Create retraining tasks dynamically in a loop
        for attr_config in attribute_configs:
            PythonOperator(
                task_id=f"retrain_{attr_config['name']}_org6",
                python_callable=forecast_next_week_and_store,
                op_kwargs={
                    'org_id': 6, 
                    'attr_id': attr_config['attr_id'],
                    'use_saved_model': False,  # Force model retraining
                    'T_in': 14,  # Use a longer input window for monthly retraining
                    'epochs': 20,  # More epochs for better training
                },
                doc_md=f"""#### Task Documentation
                Retrains LSTM model for {attr_config['name']} (org 6) using all available historical data
                """,
            )
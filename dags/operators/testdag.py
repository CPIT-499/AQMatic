from airflow import DAG
from airflow.operators.empty import EmptyOperator
import pendulum
from airflow import DAG
from airflow.operators.python import PythonOperator
import pendulum
from src.api_client.openweathermap_API import get_all_cities_air_quality
import os

# Define the DAG
dag = DAG(
    'test_dag',
    default_args={'start_date': pendulum.today('UTC').add(days=-1)},
    schedule='@daily',
    catchup=False,
)

# Define a function to print air quality data
def print_air_quality_data():
    results = get_all_cities_air_quality()
    for city, data in results.items():
        print(f"\n=== Air Quality Data for {city} ===")
        print(f"Time: {data['timestamp']}")
        print(f"AQI: {data['aqi']}")
        print("Pollutants (μg/m³):")
        for gas, value in data['components'].items():
            print(f"{gas.upper()}: {value}")

# Define the tasks
test_task = EmptyOperator(
    task_id='test_task',
    dag=dag,
)

test_task2 = EmptyOperator(
    task_id='test_task2',
    dag=dag,
)

test_task3 = EmptyOperator(
    task_id='test_task3',
    dag=dag,
)

test_task4 = EmptyOperator(
    task_id='test_task4',
    dag=dag,
)

# Task to print air quality data
air_quality_task = PythonOperator(
    task_id='print_air_quality_data',
    python_callable=print_air_quality_data,
    dag=dag,
)

# Set the task order
test_task >> test_task2 >> test_task3 >> test_task4 >> air_quality_task

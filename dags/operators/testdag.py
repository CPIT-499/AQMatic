from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.operators.python import PythonOperator
import pendulum

# Import the function to get air quality data
from src.api_client.openweathermap_API import get_all_cities_air_quality
import os



# Define the DAG
dag = DAG(
    'test_dag',
    default_args={'start_date': pendulum.today('UTC').add(days=-1)},
    schedule='@daily',
    catchup=False,
)

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


# Set the task order
test_task >> test_task2 >> test_task3

test_task3 << test_task4 

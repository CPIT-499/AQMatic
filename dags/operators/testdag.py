from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.operators.python import PythonOperator
import pendulum
from src.api_client.M_api import run_test

default_args = {
    'start_date': pendulum.datetime(2023, 1, 1, tz="UTC"),  # use a fixed past date
    'retries': 1,    #how many times to retry the task
    'retry_delay': pendulum.duration(minutes=5),   #how long to wait before retrying the task
}

with DAG(
    dag_id='test_dag',
    default_args=default_args,
    schedule_interval='*/1 * * * *',
    catchup=False,
    description="A DAG to run API tests and insert measurements into the database"
) as dag:

    start_task = EmptyOperator(
        task_id='start_task',
        doc_md="Start of the DAG."
    )

    test_python_task = PythonOperator(
        task_id='run_test',
        python_callable=run_test,
        doc_md="Fetch data from API, process it, and insert into DB."
    )

    start_task >> test_python_task
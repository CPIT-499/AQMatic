from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.operators.python import PythonOperator
import pendulum
from src.api_client.test import send_dic
from src.api_client.M_api import run_test

# Define the DAG
dag = DAG(
    'test_dag',
    default_args={'start_date': pendulum.today('UTC').add(days=-1)},
    schedule='@daily',
    catchup=False,
)



test_task4 = EmptyOperator(
    task_id='test_task4',
    dag=dag,
)

# Add a PythonOperator to invoke run_test
test_python_task = PythonOperator(
    task_id='run_test',
    python_callable=run_test,
    dag=dag,
)

# Define dependencies
test_task4 >> test_python_task
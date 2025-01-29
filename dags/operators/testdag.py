from airflow import DAG
from airflow.operators.empty import EmptyOperator
import pendulum

# Define the DAG
dag = DAG(
    'test_dag',
    default_args={'start_date': pendulum.today('UTC').add(days=-1)},
    schedule='@daily', 
    catchup=False,
)

# Define a simple task
test_task = EmptyOperator(
    task_id='test_task',
    dag=dag,
)

test_task2 = EmptyOperator(
    task_id='test_task2',
    dag=dag,
)

# Set the task in the DAG
test_task >> test_task2
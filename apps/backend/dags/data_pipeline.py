from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.operators.python import PythonOperator
from airflow.utils.task_group import TaskGroup

import pendulum


from src.api_client.openmeteo import get_weather_and_air_quality, insert_measurements_meto
from src.api_client.openweathermap_API import collect_measurements, insert_measurements_openweathermap
from operators.db_operations import create_hourly_summary_view, create_map_data_view, create_dashboard_summary_stats_view
from src.ai.forecast import forecast_next_week_and_store  # Import the new forecast function

# Define default arguments
default_args = {
    'owner': 'airflow',
    'start_date': pendulum.today('UTC').add(days=-1),
    'retries': 1,
    'retry_delay': pendulum.duration(minutes=5),
}

# Define the DAG
dag = DAG(
    'weather_data_pipeline',
    default_args=default_args,
    description='Pipeline for collecting weather data from multiple sources',
    schedule='@hourly',
    catchup=False,
    tags=['weather', 'api'],
)

# Create task groups for better organization
with dag:
    start_pipeline = EmptyOperator(
        task_id='start_pipeline'
    )

    # Meteo API Task Group
    with TaskGroup(group_id='meteo_operations') as meteo_group:
        meteo_collect = PythonOperator(
            task_id='collect_meteo_data',
            python_callable=get_weather_and_air_quality,
            do_xcom_push=True,  # Ensure the return value is pushed to XCom
            doc_md="""#### Task Documentation
            Collects weather data from Meteo API and pushes to XCom
            """,
        )

        meteo_load = PythonOperator(
            task_id='save_meteo_data',
            python_callable=insert_measurements_meto,
            doc_md="""#### Task Documentation
            Pulls data from XCom and saves to database
            """,
        )

        meteo_collect >> meteo_load

    # OpenWeather API Task Group
    with TaskGroup(group_id='openweather_operations') as openweather_group:
        openweather_collect = PythonOperator(
            task_id='collect_openweather_data',
            python_callable=collect_measurements,
            do_xcom_push=True,
            doc_md="""#### Task Documentation
            Collects weather data from OpenWeatherMap API
            """,
        )
        openweather_load = PythonOperator(
            task_id='save_openweather_data',
            python_callable=insert_measurements_openweathermap,
            doc_md="""#### Task Documentation
            Saves weather data from OpenWeatherMap API to database
            """,
        )
        openweather_collect >> openweather_load

    # Database View Task Group
    with TaskGroup(group_id='db_view_operations') as db_view_group:
        create_hourly_view_task = PythonOperator(
            task_id='create_hourly_summary_view',
            python_callable=create_hourly_summary_view,
        )
        
        create_map_view_task = PythonOperator(
            task_id='create_map_data_view',
            python_callable=create_map_data_view,
        )
        create_dashboard_summary_stats_view_task = PythonOperator(
            task_id='create_dashboard_summary_stats_view',
            python_callable=create_dashboard_summary_stats_view,
        )
        
        create_hourly_view_task >> create_map_view_task >> create_dashboard_summary_stats_view_task

    # AI Forecasting Task Group
    with TaskGroup(group_id='ai_forecast_operations') as ai_forecast_group:
        # Example forecasting tasks - modify organization IDs and attribute IDs as needed
        forecast_co2_org1_task = PythonOperator(
            task_id='forecast_co2_org1',
            python_callable=forecast_next_week_and_store,
            op_kwargs={'org_id': 6, 'attr_id': 4},  # Assuming org_id=1, attr_id=1 is CO2
            doc_md="""#### Task Documentation
            Forecasts CO2 levels for organization 1 for the next 7 days
            """,
        )
        
        forecast_pm25_org1_task = PythonOperator(
            task_id='forecast_pm25_org1',
            python_callable=forecast_next_week_and_store,
            op_kwargs={'org_id': 6, 'attr_id': 3},  # Assuming org_id=1, attr_id=2 is PM2.5
            doc_md="""#### Task Documentation
            Forecasts PM2.5 levels for organization 1 for the next 7 days
            """,
        )

    end_pipeline = EmptyOperator(
        task_id='end_pipeline'
    )

    # Define the complete workflow
    start_pipeline >> [meteo_group, openweather_group] >> db_view_group >> ai_forecast_group >> end_pipeline
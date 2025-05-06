from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.operators.python import PythonOperator
from airflow.utils.task_group import TaskGroup
from airflow.sensors.time_delta import TimeDeltaSensor
from datetime import datetime, timedelta
import unittest
import subprocess
import sys
import os

import pendulum


from src.api_client.openmeteo import get_weather_and_air_quality, insert_measurements_meto
from src.api_client.openweathermap_API import collect_measurements, insert_measurements_openweathermap
from operators.db_operations import create_hourly_summary_view, create_map_data_view, create_dashboard_summary_stats_view, create_forecast_summary_view
from operators.ApiTest import run_api_tests
from src.ai.forecast import forecast_and_store_results

# Define default arguments
default_args = {
    'owner': 'airflow',
    'start_date': pendulum.today('UTC').add(days=-1),
    'retries': 1,
    'retry_delay': pendulum.duration(minutes=5),
}

# Define the DAG to run hourly
dag = DAG(
    'weather_data_pipeline',
    default_args=default_args,
    description='Pipeline for collecting weather data from multiple sources',
    schedule='@hourly',
    catchup=False,
    tags=['weather', 'api'],
)

with dag:
    start_pipeline = EmptyOperator(
        task_id='start_pipeline'
    )

    # Meteo API Task Group
    with TaskGroup(group_id='meteo_operations') as meteo_group:
        meteo_collect = PythonOperator(
            task_id='collect_meteo_data',
            python_callable=get_weather_and_air_quality,
            do_xcom_push=True,  
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
    # API testing group
    with TaskGroup(group_id='api_testing') as api_test_group:
        run_api_tests_task = PythonOperator(
            task_id='run_api_unit_tests',
            python_callable=run_api_tests,
            do_xcom_push=True,  # Push test success status to XCom
            doc_md="""####  unit tests to verify API functionality
            """,
        )
        
        # Add branching based on test results if needed
        handle_test_results = PythonOperator(
            task_id='handle_test_results',
            python_callable=lambda ti: print(f"API Tests {'passed' if ti.xcom_pull(task_ids='api_testing.run_api_unit_tests') else 'failed'}"),
            doc_md="""#### Task Documentation
            Logs the result of the API tests
            """,
        )
        
        run_api_tests_task >> handle_test_results

    # Weekly schedule check for AI forecasting
    # This will only run once per week (every 7 days)

    
    # AI Forecasting Task Group - Only runs weekly
    with TaskGroup(group_id='ai_forecast_operations') as ai_forecast_group:
        # Define attribute IDs and their names
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
        
        # Create forecasting tasks dynamically in a loop
        forecasting_tasks = []
        for attr_config in attribute_configs:
            forecast_task = PythonOperator(
                task_id=f"forecast_{attr_config['name']}_org6",
                python_callable=forecast_and_store_results,
                op_kwargs={
                    'org_id': 6,
                    'attr_id': attr_config['attr_id']
                },
                doc_md=f"""#### Task Documentation
                Forecasts {attr_config['name']} levels for organization 6
                for the next 7 days using saved model
                """,
            )
            forecasting_tasks.append(forecast_task)

    # Create forecast summary view task (outside of any group) - Only runs weekly
    create_forecast_view_task = PythonOperator(
        task_id='create_forecast_summary_view',
        python_callable=create_forecast_summary_view,
    )

    end_pipeline = EmptyOperator(
        task_id='end_pipeline'
    )

    # Define the complete workflow with conditional branching
    start_pipeline >> [meteo_group, openweather_group] >> db_view_group >> api_test_group >> ai_forecast_group >> create_forecast_view_task >> end_pipeline

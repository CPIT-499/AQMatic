FROM apache/airflow:latest
USER root
COPY --chown=airflow:airflow requirements.txt /requirements.txt
USER airflow
RUN pip install --no-cache-dir -r /requirements.txt


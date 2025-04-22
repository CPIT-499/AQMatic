FROM apache/airflow:2.7.0

# Use absolute path to copy requirements.txt
COPY --chown=airflow:root ../../requirements.txt /opt/airflow/requirements.txt
# Install packages as the airflow user
RUN pip install --no-cache-dir -r /opt/airflow/requirements.txt

# No need to switch users since we never switched to root


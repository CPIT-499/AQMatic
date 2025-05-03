# Use PostgreSQL 17 to match your dump file version
FROM postgres:17.4

# Copy initialization files to the docker-entrypoint-initdb.d directory
COPY initdb.d/01_load_db_dump.sql /docker-entrypoint-initdb.d/
COPY initdb.d/02_init_airflow.sql /docker-entrypoint-initdb.d/
COPY initdb.d/03_init_airflow_db.sql /docker-entrypoint-initdb.d/
COPY initdb.d/z_create_forecasts_table.sql /docker-entrypoint-initdb.d/


# Make sure the scripts are executable and will be run during initialization
RUN chmod 755 /docker-entrypoint-initdb.d/*.sql

# Expose the PostgreSQL port
EXPOSE 5432

# Set a volume to persist data
VOLUME /var/lib/postgresql/data
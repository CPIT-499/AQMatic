# Use the official PostgreSQL image
FROM postgres:latest

# Copy the SQL scripts from the sql-scripts folder
COPY initdb.d/01_schema.sql /docker-entrypoint-initdb.d/
COPY initdb.d/02_command.sql /docker-entrypoint-initdb.d/
COPY initdb.d/03_insert_data.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432

# Set a volume to persist data
VOLUME /var/lib/postgresql/data
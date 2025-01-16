# Use the official PostgreSQL image
FROM postgres:latest

# Copy the schema.sql file from the correct folder
COPY schema.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432

# Set a volume to persist data
VOLUME /var/lib/postgresql/data
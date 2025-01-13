# Use the official PostgreSQL image
FROM postgres:latest

# Set non-sensitive environment variables
ENV POSTGRES_USER=admin
ENV POSTGRES_DB=mydatabase

# Copy the schema.sql file from the correct folder
COPY my-postgres-project/schema.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432

# Set a volume to persist data
VOLUME /var/lib/postgresql/data
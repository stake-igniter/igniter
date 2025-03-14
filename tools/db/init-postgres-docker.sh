#!/bin/bash

# Usage check: require exactly two parameters
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <container_name> <postgres_password>"
  exit 1
fi

CONTAINER_NAME=$1
POSTGRES_PASSWORD=$2

# Define directory for certificates
CERT_DIR="./certs"

# Create the certificate directory if it doesn't exist
if [ ! -d "$CERT_DIR" ]; then
  mkdir "$CERT_DIR"
fi

# Check if the self-signed certificate and key exist; generate if missing
if [ ! -f "$CERT_DIR/server.crt" ] || [ ! -f "$CERT_DIR/server.key" ]; then
  echo "Generating self-signed certificate..."
  # Generate a new private key and certificate signing request (CSR)
  openssl req -new -nodes -text \
    -out "$CERT_DIR/server.csr" \
    -keyout "$CERT_DIR/server.key" \
    -subj "/CN=localhost"

  # Self-sign the certificate with the CSR and key, valid for 365 days
  openssl x509 -req -in "$CERT_DIR/server.csr" \
    -signkey "$CERT_DIR/server.key" \
    -out "$CERT_DIR/server.crt" \
    -days 365

  # Clean up the CSR file
  rm "$CERT_DIR/server.csr"

  # Set proper permissions for the key and certificate files
  chmod 600 "$CERT_DIR/server.key"
  chmod 644 "$CERT_DIR/server.crt"
fi

# Run the PostgreSQL container with SSL enabled and proper initialization.
# We mount the local certs directory to /certs in the container.
# We override the entrypoint to run a bash shell that:
#   1. Changes the owner of the server.key to 'postgres'
#   2. Executes the official docker-entrypoint.sh, which initializes the database if needed,
#      and then starts PostgreSQL with SSL enabled.
echo "Starting docker container '$CONTAINER_NAME' with PostgreSQL and SSL enabled..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -p 5432:5432 \
  -v "$(pwd)/certs":/certs \
  --entrypoint bash \
  postgres:latest \
  -c "chown postgres:postgres /certs/server.key && exec docker-entrypoint.sh postgres -c ssl=on -c ssl_cert_file=/certs/server.crt -c ssl_key_file=/certs/server.key"

echo "Container '$CONTAINER_NAME' started successfully."

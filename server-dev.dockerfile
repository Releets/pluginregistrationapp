FROM denoland/deno:2.0.0

# Set the working directory
WORKDIR /opt/pluginregistrationapp

# Prefer not to run as root.
USER deno

# Define data volume
VOLUME [ "/opt/pluginregistrationapp/data" ]

# Copy the app to the container
COPY server server/
COPY models models/

WORKDIR /opt/pluginregistrationapp/server

# Install dependencies
RUN deno install

# PORTS
EXPOSE 6969

# Start the app
CMD [ "task", "dev" ]

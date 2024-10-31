FROM denoland/deno:2.0.0

# Set the working directory
WORKDIR /opt/pluginregistrationapp

# Define data volume
VOLUME [ "/opt/pluginregistrationapp/data" ]

ENV GODMODE password

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

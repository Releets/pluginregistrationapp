FROM node:22-alpine

# Set the working directory
WORKDIR /opt/pluginregistrationapp

# Environment variables
ENV VITE_BACKEND_URL http://localhost:6969

# PORTS
EXPOSE 5173

# Copy the app to the container
COPY client client/
COPY models models/

WORKDIR /opt/pluginregistrationapp/client

# Install dependencies and run
RUN npm install

# Start the app
CMD [ "npm", "start" ]

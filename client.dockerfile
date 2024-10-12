FROM node:22-alpine

# Set the working directory
WORKDIR /opt/pluginregistrationapp

# Environment variables
ARG BACKEND_URL
ENV VITE_BACKEND_URL $BACKEND_URL

# PORTS
EXPOSE 5173

# Copy the app to the container
COPY client client/
COPY models models/

WORKDIR /opt/pluginregistrationapp/client

# Install dependencies
RUN npm install -g serve && npm install && npm run build

# Start the app
CMD [ "serve", "-s", "build" ]

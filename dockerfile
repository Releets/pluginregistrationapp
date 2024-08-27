FROM node:18-alpine

# Set the working directory
WORKDIR /opt/pluginregistrationapp

# Copy the app to the container
COPY public public/
COPY src src/
COPY package.json .

# Install dependencies
RUN npm install

# Specify persistent data folder
VOLUME . src/data

# PORTS
EXPOSE 3001

# Start the app
ENTRYPOINT npm start

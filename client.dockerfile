FROM --platform=$BUILDPLATFORM node:22-alpine AS build

# Set the working directory
WORKDIR /opt/pluginregistrationapp

# Environment variables
ARG BACKEND_URL
ENV VITE_BACKEND_URL=$BACKEND_URL

# Copy the app to the container
COPY client client/
COPY models models/

WORKDIR /opt/pluginregistrationapp/client

# Build static assets once on the builder platform
RUN npm install && npm run build

FROM nginx:1.27-alpine

# PORTS
EXPOSE 5173

# Serve the built client with nginx
COPY --from=build /opt/pluginregistrationapp/client/build /usr/share/nginx/html
RUN printf '%s\n' \
  'server {' \
  '  listen 5173;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  location / {' \
  '    try_files $uri /index.html;' \
  '  }' \
  '}' \
  > /etc/nginx/conf.d/default.conf

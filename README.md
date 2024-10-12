# Plugin Registration Queue Webapp

## Development Setup

1. Install and run [Docker Desktop](https://www.docker.com/products/docker-desktop/)
1. Run `docker compose up --build --watch`
1. Open `http://localhost:5173` in your browser
1. Profit?

## Docker Compose Example

```yaml
services:
  client:
    container_name: pluginregapp-client
    image: tobasl/pluginregistrationapp-client
    ports:
      - '5173:5173'
    restart: always
    depends_on:
      - server

  server:
    container_name: pluginregapp-server
    image: tobasl/pluginregistrationapp-server
    ports:
      - '6969:6969'
    restart: always
    volumes:
      - /mnt/user/appdata/pluginregistrationapp:/opt/pluginregistrationapp/data
```

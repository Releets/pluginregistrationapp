# Plugin Registration Queue Webapp

## Development Setup

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
1. Run `docker compose up --build --watch`
1. Open `http://localhost:3000` in your browser
1. Profit?

## Docker Compose Example

```yaml
services:
  frontend:
    image: tobasl/pluginregistrationapp-client
    ports:
      - "6970:3000"
    restart: always
  
  backend:
    image: tobasl/pluginregistrationapp-server
    ports:
      - "6969:6969"
    restart: always
    volumes:
      - /mnt/user/appdata/pluginregistrationapp:/opt/pluginregistrationapp/data
```
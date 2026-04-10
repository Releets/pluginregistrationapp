# Plugin Registration Queue Webapp

## Development Setup

1. Install and run [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Run `docker compose up --build --watch`
3. Open `http://localhost:5173` in your browser
4. Profit?

To test the production build, run

```bash
docker compose -f docker-compose-production.yml up --build
```

## Environment Variables


| Name               | Used by                                | Required          | Example                 | Description                                                                                    |
| ------------------ | -------------------------------------- | ----------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `GODMODE`          | Server (`backend`)                     | Yes               | `admin`                 | Password that allows privileged queue removal (`godmodePassword`).                             |
| `TABS`             | Server (`backend`)                     | Yes               | `Safest,Nordamed`       | Comma-separated tab labels. These are normalized to lowercase IDs and exposed via `GET /tabs`. |
| `VITE_BACKEND_URL` | Client (`frontend`)                    | Yes               | `http://localhost:6969` | Base URL used by the web app for REST + Socket.IO calls.                                       |
| `BACKEND_URL`      | Docker build arg (`client.dockerfile`) | For Docker builds | `http://localhost:6969` | Build-time value mapped to `VITE_BACKEND_URL` in the client image.                             |


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
    environment:
      GODMODE: admin
      TABS: Safest,Nordamed
    restart: always
    volumes:
      - /mnt/user/appdata/pluginregistrationapp:/opt/pluginregistrationapp/data
```


# Docker Setup for AI Profiles

This document explains how to run the AI Profiles application using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

### Using Docker Compose (Recommended)

1. Build and start the application:

   ```bash
   docker-compose up -d
   ```

2. View logs:

   ```bash
   docker-compose logs -f
   ```

3. Stop the application:
   ```bash
   docker-compose down
   ```

### Using Docker CLI

1. Build the image:

   ```bash
   docker build -t ai-profiles .
   ```

2. Run the container:

   ```bash
   docker run -d \
     -p 3000:3000 \
     -v $(pwd)/data:/app/data \
     --name ai-profiles \
     ai-profiles
   ```

3. View logs:

   ```bash
   docker logs -f ai-profiles
   ```

4. Stop the container:
   ```bash
   docker stop ai-profiles
   docker rm ai-profiles
   ```

## Configuration

### Environment Variables

You can customize the application by setting environment variables:

- `PORT`: The port the application runs on (default: 3000)
- `DATABASE_PATH`: Path to the SQLite database file (default: /app/data/data.sqlite)
- `NODE_ENV`: Environment mode (default: production)

Example with docker-compose:

```yaml
environment:
  - PORT=8080
  - DATABASE_PATH=/app/data/custom.sqlite
```

Example with Docker CLI:

```bash
docker run -d \
  -p 8080:8080 \
  -e PORT=8080 \
  -e DATABASE_PATH=/app/data/custom.sqlite \
  -v $(pwd)/data:/app/data \
  ai-profiles
```

## Data Persistence

The SQLite database is persisted in the `./data` directory on your host machine. This ensures that your data survives container restarts and rebuilds.

To backup your database:

```bash
cp data/data.sqlite data/data.sqlite.backup
```

## Accessing the Application

Once running, access the application at:

```
http://localhost:3000
```

## Troubleshooting

### Check if the container is running:

```bash
docker ps
```

### View container logs:

```bash
docker-compose logs -f
# or
docker logs -f ai-profiles
```

### Access the container shell:

```bash
docker-compose exec app sh
# or
docker exec -it ai-profiles sh
```

### Rebuild the image:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Health Check

The Docker image includes a health check that runs every 30 seconds. You can view the health status:

```bash
docker inspect --format='{{json .State.Health}}' ai-profiles
```

## Development vs Production

This Dockerfile is optimized for production use. For development, it's recommended to use:

```bash
bun --watch src/server.ts
```

directly on your host machine for hot-reloading and faster iteration.

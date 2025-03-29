# Swift Web Dashboard Docker Guide

This guide provides instructions for running the Swift Web Dashboard using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Running in Production Mode

To build and run the application in production mode:

```bash
# Navigate to the web-dashboard directory
cd /path/to/swift/web-dashboard

# Build and start the container
docker-compose up --build
```

The application will be available at http://localhost:3000

To stop the application:

```bash
docker-compose down
```

## Running in Development Mode

For development with hot-reloading:

```bash
# Navigate to the web-dashboard directory
cd /path/to/swift/web-dashboard

# Build and start the development container
docker-compose -f docker-compose.dev.yml up --build
```

The development server will be available at http://localhost:3000 with hot-reloading enabled.

To stop the development server:

```bash
docker-compose -f docker-compose.dev.yml down
```

## Building Docker Image Manually

If you want to build the Docker image manually:

```bash
# Build the image
docker build -t swift-web-dashboard .

# Run the container
docker run -p 3000:3000 swift-web-dashboard
```

## Environment Variables

You can customize the application behavior by providing environment variables:

```bash
# Example: Setting a custom port
docker run -p 8080:3000 -e PORT=3000 swift-web-dashboard
```

## Troubleshooting

If you encounter any issues:

1. Make sure Docker is running properly on your system
2. Check the Docker logs for errors:
   ```bash
   docker-compose logs
   ```
3. Ensure all the required ports are available on your host machine
4. Try rebuilding the image from scratch:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

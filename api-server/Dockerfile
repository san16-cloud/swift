# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install instead of npm ci to generate package-lock.json)
RUN npm install

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Create a non-root user to run the application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create and set permissions for logs directory
RUN mkdir -p /logs && chown -R appuser:appgroup /logs

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy build artifacts from builder stage
COPY --from=builder /app/build ./build

# Switch to non-root user
USER appuser

# Expose API port
EXPOSE 4000

# Volume for logs
VOLUME ["/logs"]

# Command to run the server
CMD ["node", "build/index.js"]

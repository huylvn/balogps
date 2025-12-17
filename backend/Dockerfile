FROM node:18-alpine

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Copy frontend source to build
COPY frontend/ /tmp/frontend/

# Build frontend
WORKDIR /tmp/frontend
RUN npm ci && npm run build

# Copy built frontend to backend
RUN cp -r /tmp/frontend/build /app/build && rm -rf /tmp/frontend

# Back to app directory
WORKDIR /app

# Generate SSL certificates on container start if they don't exist
RUN mkdir -p ssl

EXPOSE 3000 3443

# Run migrations and start server
CMD ["sh", "-c", "node generate-cert.js && node src/database/migrate.js && node src/server.js"]

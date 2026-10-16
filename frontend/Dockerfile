# ==============================================================================
# Multi-Stage Dockerfile for Angular Web Frontend
# ==============================================================================

# Stage 1: Build Angular Production Bundle
FROM node:20-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default static assets
RUN rm -rf ./*

# Copy built artifacts from Stage 1
COPY --from=builder /app/dist/frontend/browser ./

# Copy Nginx configuration with SPA routing & security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

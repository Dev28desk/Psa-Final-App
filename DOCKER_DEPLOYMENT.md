# Docker Deployment Guide - Alternative VPS Setup

## Why Docker?

Docker deployment offers several advantages:
- **Consistency**: Same environment across development and production
- **Portability**: Easy to move between servers
- **Scalability**: Simple to scale individual components
- **Isolation**: Better security and resource management

## Prerequisites

- VPS with Ubuntu 22.04
- Docker and Docker Compose installed
- Domain name configured

## Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

## Step 2: Create Docker Configuration

### 2.1 Create Dockerfile
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### 2.2 Create Docker Compose File
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://parmanand_user:${DB_PASSWORD}@db:5432/parmanand_sports
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=parmanand_sports
      - POSTGRES_USER=parmanand_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### 2.3 Environment Configuration
```bash
# Create .env file
nano .env
```

```env
# Database
DB_PASSWORD=your_secure_database_password

# Application
NODE_ENV=production
SESSION_SECRET=your_session_secret

# API Keys
GEMINI_API_KEY=your_gemini_api_key
WHATSAPP_API_KEY=your_whatsapp_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Domain
DOMAIN=yourdomain.com
```

## Step 3: Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## Step 4: Auto-deployment with Watchtower

```yaml
# Add to docker-compose.yml
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 3600
    restart: unless-stopped
```

This setup provides automated container updates and simpler deployment process.

## Benefits of Docker Deployment

1. **Easier Updates**: Simple `docker-compose pull && docker-compose up -d`
2. **Better Isolation**: Each service runs in its own container
3. **Simplified Backup**: Volume-based data management
4. **Scalability**: Easy to add more instances
5. **Consistency**: Same environment everywhere

Choose Docker if you prefer containerized deployments, or use the traditional VPS setup for more direct control.
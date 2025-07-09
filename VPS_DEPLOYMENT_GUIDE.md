# VPS Deployment Guide - Parmanand Sports Academy

## Server Requirements

### Minimum Specifications
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS (recommended)
- **Network**: 1Gbps connection

### Recommended Specifications
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Backup**: Additional storage for backups

## Step 1: Server Setup

### 1.1 Initial Server Configuration
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Create a new user for the application
sudo adduser parmanand
sudo usermod -aG sudo parmanand

# Switch to the new user
su - parmanand
```

### 1.2 Install Node.js
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.3 Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

```sql
-- In PostgreSQL prompt
CREATE DATABASE parmanand_sports;
CREATE USER parmanand_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE parmanand_sports TO parmanand_user;
ALTER USER parmanand_user CREATEDB;
\q
```

### 1.4 Install PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command
```

## Step 2: Application Deployment

### 2.1 Clone and Setup Application
```bash
# Clone your repository (or upload your code)
git clone https://github.com/your-username/parmanand-sports-academy.git
cd parmanand-sports-academy

# Install dependencies
npm install

# Install TypeScript globally
sudo npm install -g typescript tsx

# Build the application
npm run build
```

### 2.2 Environment Configuration
```bash
# Create production environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production
```

```env
# Database Configuration
DATABASE_URL=postgresql://parmanand_user:your_secure_password@localhost:5432/parmanand_sports
PGHOST=localhost
PGPORT=5432
PGUSER=parmanand_user
PGPASSWORD=your_secure_password
PGDATABASE=parmanand_sports

# Application Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=your_very_secure_session_secret_here

# API Keys
GEMINI_API_KEY=your_gemini_api_key
WHATSAPP_API_KEY=your_whatsapp_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Security
CORS_ORIGIN=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2.3 Database Migration
```bash
# Run database migrations
npm run db:push

# Seed initial data (if available)
npm run db:seed
```

## Step 3: Web Server Setup

### 3.1 Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.2 Configure Nginx
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/parmanand-sports
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be configured with Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubdomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Static files
    location /assets {
        alias /home/parmanand/parmanand-sports-academy/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.3 Enable Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/parmanand-sports /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 4: SSL Certificate Setup

### 4.1 Install Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Step 5: Application Process Management

### 5.1 Create PM2 Ecosystem File
```bash
# Create PM2 configuration
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'parmanand-sports-academy',
    script: 'server/index.ts',
    interpreter: 'tsx',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
```

### 5.2 Start Application
```bash
# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Monitor application
pm2 status
pm2 logs
```

## Step 6: Security Configuration

### 6.1 Firewall Setup
```bash
# Install and configure UFW
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### 6.2 Fail2Ban (Optional)
```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure Fail2Ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Start and enable Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

## Step 7: Backup Configuration

### 7.1 Database Backup Script
```bash
# Create backup script
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/parmanand/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="parmanand_sports"
DB_USER="parmanand_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql" -type f -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
```

```bash
# Make script executable
chmod +x ~/backup-db.sh

# Add to crontab for daily backups
crontab -e
# Add this line:
0 2 * * * /home/parmanand/backup-db.sh
```

## Step 8: Monitoring and Maintenance

### 8.1 Log Management
```bash
# View application logs
pm2 logs

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -f
```

### 8.2 Performance Monitoring
```bash
# Install htop for system monitoring
sudo apt install -y htop

# Monitor system resources
htop

# Monitor PM2 processes
pm2 monit
```

## Step 9: Domain and DNS Configuration

### 9.1 DNS Records
Configure these DNS records with your domain provider:

```
Type    Name            Value
A       yourdomain.com  YOUR_SERVER_IP
A       www             YOUR_SERVER_IP
```

### 9.2 Update Environment Variables
```bash
# Update your environment file with actual domain
nano .env.production
```

## Step 10: Application Updates

### 10.1 Update Script
```bash
# Create update script
nano ~/update-app.sh
```

```bash
#!/bin/bash
cd /home/parmanand/parmanand-sports-academy

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Run migrations
npm run db:push

# Restart application
pm2 restart parmanand-sports-academy

echo "Application updated successfully"
```

```bash
# Make script executable
chmod +x ~/update-app.sh
```

## Deployment Checklist

### Pre-deployment
- [ ] Server meets minimum requirements
- [ ] Domain name configured
- [ ] SSL certificate obtained
- [ ] Environment variables configured
- [ ] Database created and migrated

### Post-deployment
- [ ] Application starts successfully
- [ ] HTTPS works correctly
- [ ] Database connections work
- [ ] API endpoints respond
- [ ] WebSocket connections work
- [ ] File uploads function
- [ ] Email/SMS notifications work

### Security
- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] Strong passwords used
- [ ] Regular backups scheduled
- [ ] Monitoring setup

## Costs Estimation

### Monthly VPS Costs
- **Basic VPS (4GB RAM, 2 vCPUs)**: $10-20/month
- **Domain name**: $10-15/year
- **SSL Certificate**: Free (Let's Encrypt)
- **Backup storage**: $5-10/month

### Total Monthly Cost: $15-30

This is significantly cheaper than managed hosting solutions and gives you full control over your infrastructure.

## Support and Maintenance

### Regular Tasks
- Update system packages monthly
- Monitor application logs
- Check backup integrity
- Update SSL certificates (automatic)
- Monitor disk space usage

Your application is now ready for production deployment on your own VPS!
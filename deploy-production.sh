#!/bin/bash

# Parmanand Sports Academy - VPS Deployment Script
# Server: 154.201.126.10
# Repository: https://github.com/Dev28desk/Psa-Final-App

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Dev28desk/Psa-Final-App.git"
APP_DIR="/var/www/parmanand-sports-academy"
DB_PASSWORD="StrongPassword123!"
SESSION_SECRET=$(openssl rand -base64 32)

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=========================================="
echo "  Parmanand Sports Academy Deployment"
echo "  Server: 154.201.126.10"
echo "=========================================="
echo

# 1. Update system
print_status "Updating system packages..."
apt update && apt upgrade -y
apt install -y curl wget git unzip software-properties-common build-essential

# 2. Install Node.js 20
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2 tsx typescript
print_success "Node.js $(node --version) installed"

# 3. Install PostgreSQL
print_status "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Create database and user
print_status "Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE parmanand_sports;"
sudo -u postgres psql -c "CREATE USER parmanand_user WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE parmanand_sports TO parmanand_user;"
sudo -u postgres psql -c "ALTER USER parmanand_user CREATEDB;"
print_success "Database configured"

# 4. Install Nginx
print_status "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx installed"

# 5. Clone application
print_status "Cloning application from GitHub..."
rm -rf $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR
print_success "Application cloned"

# 6. Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# 7. Create environment file
print_status "Creating environment configuration..."
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://parmanand_user:$DB_PASSWORD@localhost:5432/parmanand_sports
PGHOST=localhost
PGPORT=5432
PGUSER=parmanand_user
PGPASSWORD=$DB_PASSWORD
PGDATABASE=parmanand_sports

# Application Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=$SESSION_SECRET

# Optional API Keys (add yours if available)
GEMINI_API_KEY=your_gemini_api_key_here
WHATSAPP_API_KEY=your_whatsapp_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Security
CORS_ORIGIN=http://154.201.126.10
ALLOWED_ORIGINS=http://154.201.126.10:3000,http://154.201.126.10
EOF

# 8. Setup database
print_status "Setting up database schema..."
npm run db:push
print_success "Database schema created"

# 9. Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'parmanand-sports-academy',
    script: 'server/index.ts',
    interpreter: 'tsx',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 2,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs
print_success "PM2 configuration created"

# 10. Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/parmanand-sports << 'EOF'
server {
    listen 80;
    server_name 154.201.126.10;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # API and WebSocket routes
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
EOF

# Enable site and restart Nginx
ln -sf /etc/nginx/sites-available/parmanand-sports /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
print_success "Nginx configured"

# 11. Start application
print_status "Starting application..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
print_success "Application started"

# 12. Configure firewall
print_status "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000
print_success "Firewall configured"

# 13. Create backup script
print_status "Creating backup script..."
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="parmanand_sports"
DB_USER="parmanand_user"
DB_PASS="StrongPassword123!"

mkdir -p $BACKUP_DIR
export PGPASSWORD=$DB_PASS
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql
find $BACKUP_DIR -name "db_backup_*.sql" -type f -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
EOF

chmod +x /root/backup-db.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-db.sh") | crontab -
print_success "Backup script created"

echo
print_success "=========================================="
print_success "  Deployment completed successfully!"
print_success "=========================================="
echo
print_status "Your application is now running at:"
print_success "http://154.201.126.10"
echo
print_status "Application management commands:"
echo "  pm2 status                    - Check application status"
echo "  pm2 logs                      - View application logs"
echo "  pm2 restart parmanand-sports-academy - Restart application"
echo "  pm2 stop parmanand-sports-academy    - Stop application"
echo
print_status "Database backup:"
echo "  /root/backup-db.sh           - Manual backup"
echo "  Automated daily backups at 2 AM"
echo
print_status "Configuration files:"
echo "  Application: $APP_DIR"
echo "  Environment: $APP_DIR/.env"
echo "  Nginx: /etc/nginx/sites-available/parmanand-sports"
echo "  PM2: $APP_DIR/ecosystem.config.js"
echo

print_status "Testing application..."
sleep 5
if curl -s http://localhost:3000/api/dashboard/stats > /dev/null; then
    print_success "Application is responding correctly!"
else
    print_error "Application may not be responding. Check logs with: pm2 logs"
fi
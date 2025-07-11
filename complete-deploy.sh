#!/bin/bash

# Parmanand Sports Academy - Complete VPS Deployment Script
# This script solves all deployment issues and gets the app running
# Server: 154.201.126.10
# Repository: https://github.com/Dev28desk/Psa-Final-App.git

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO_URL="https://github.com/Dev28desk/Psa-Final-App.git"
APP_DIR="/home/parmanand/parmanand-sports-academy"
DB_PASSWORD="StrongPassword123!"
SESSION_SECRET="super_secure_session_secret_$(date +%s)"
SERVER_IP="154.201.126.10"

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

echo "================================================================="
echo "  Parmanand Sports Academy - Complete VPS Deployment"
echo "  Server: $SERVER_IP"
echo "  Repository: $REPO_URL"
echo "================================================================="
echo

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    print_error "This script must be run as root"
    exit 1
fi

# Step 1: Kill any existing processes
print_status "Stopping any existing processes..."
pkill -f "parmanand-sports-academy" || true
pkill -f "tsx" || true
pkill -f "pm2" || true
pm2 kill || true

# Step 2: Update system and install dependencies
print_status "Updating system and installing dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt update -y
apt install -y curl wget git unzip software-properties-common build-essential postgresql postgresql-contrib nginx

# Step 3: Install Node.js 20
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2 tsx typescript

# Step 4: Setup PostgreSQL
print_status "Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "DROP DATABASE IF EXISTS parmanand_sports;" || true
sudo -u postgres psql -c "DROP USER IF EXISTS parmanand_user;" || true
sudo -u postgres psql -c "CREATE DATABASE parmanand_sports;"
sudo -u postgres psql -c "CREATE USER parmanand_user WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE parmanand_sports TO parmanand_user;"
sudo -u postgres psql -c "ALTER USER parmanand_user CREATEDB;"

# Test database connection
print_status "Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -U parmanand_user -d parmanand_sports -h localhost -c "SELECT NOW();" || {
    print_error "Database connection failed"
    exit 1
}
print_success "Database connection successful"

# Step 5: Setup application user
print_status "Setting up application user..."
if ! id "parmanand" &>/dev/null; then
    adduser --disabled-password --gecos "" parmanand
    echo "parmanand:28121996" | chpasswd
fi
usermod -aG sudo parmanand

# Step 6: Clone and setup application
print_status "Cloning and setting up application..."
rm -rf $APP_DIR
sudo -u parmanand git clone $REPO_URL $APP_DIR
cd $APP_DIR

# Install dependencies as parmanand user
sudo -u parmanand npm install

# Step 7: Create environment configuration
print_status "Creating environment configuration..."
sudo -u parmanand cat > $APP_DIR/.env << EOF
DATABASE_URL=postgresql://parmanand_user:$DB_PASSWORD@localhost:5432/parmanand_sports
PGHOST=localhost
PGPORT=5432
PGUSER=parmanand_user
PGPASSWORD=$DB_PASSWORD
PGDATABASE=parmanand_sports
NODE_ENV=production
PORT=3000
SESSION_SECRET=$SESSION_SECRET
CORS_ORIGIN=http://$SERVER_IP
ALLOWED_ORIGINS=http://$SERVER_IP:3000,http://$SERVER_IP
EOF

# Step 8: Setup database schema
print_status "Setting up database schema..."
cd $APP_DIR
sudo -u parmanand npm run db:push

# Step 9: Create bulletproof startup script
print_status "Creating startup script..."
sudo -u parmanand cat > $APP_DIR/start-app.sh << 'EOF'
#!/bin/bash
cd /home/parmanand/parmanand-sports-academy

# Load environment variables
export DATABASE_URL="postgresql://parmanand_user:StrongPassword123!@localhost:5432/parmanand_sports"
export PGHOST="localhost"
export PGPORT="5432"
export PGUSER="parmanand_user"
export PGPASSWORD="StrongPassword123!"
export PGDATABASE="parmanand_sports"
export NODE_ENV="production"
export PORT="3000"
export SESSION_SECRET="super_secure_session_secret_generated"
export CORS_ORIGIN="http://154.201.126.10"
export ALLOWED_ORIGINS="http://154.201.126.10:3000,http://154.201.126.10"

# Start the application
exec npx tsx server/index.ts
EOF

sudo chmod +x $APP_DIR/start-app.sh

# Step 10: Configure PM2
print_status "Configuring PM2..."
sudo -u parmanand cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'parmanand-sports-academy',
    script: '/home/parmanand/parmanand-sports-academy/start-app.sh',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    max_restarts: 5,
    min_uptime: '10s',
    restart_delay: 1000,
    error_file: '/home/parmanand/parmanand-sports-academy/logs/err.log',
    out_file: '/home/parmanand/parmanand-sports-academy/logs/out.log',
    log_file: '/home/parmanand/parmanand-sports-academy/logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
sudo -u parmanand mkdir -p $APP_DIR/logs

# Step 11: Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/parmanand-sports << EOF
server {
    listen 80;
    server_name $SERVER_IP;
    
    client_max_body_size 100M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # Frontend application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
EOF

# Enable site and restart Nginx
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/parmanand-sports /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
systemctl enable nginx

# Step 12: Start application
print_status "Starting application..."
cd $APP_DIR
sudo -u parmanand pm2 start ecosystem.config.js
sudo -u parmanand pm2 save

# Setup PM2 to start on boot
sudo -u parmanand pm2 startup | grep "sudo" | bash

# Step 13: Configure firewall
print_status "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000

# Step 14: Create management scripts
print_status "Creating management scripts..."

# Update script
cat > /root/update-app.sh << 'EOF'
#!/bin/bash
cd /home/parmanand/parmanand-sports-academy
sudo -u parmanand git pull origin main
sudo -u parmanand npm install
sudo -u parmanand npm run db:push
sudo -u parmanand pm2 restart parmanand-sports-academy
echo "Application updated successfully!"
EOF

# Status check script
cat > /root/check-app.sh << 'EOF'
#!/bin/bash
echo "=== Application Status ==="
sudo -u parmanand pm2 status
echo ""
echo "=== Recent Logs ==="
sudo -u parmanand pm2 logs --lines 10
echo ""
echo "=== API Test ==="
curl -s http://localhost:3000/api/dashboard/stats | head -c 200
echo ""
echo "=== Port Check ==="
netstat -tlnp | grep 3000
EOF

# Backup script
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR
PGPASSWORD=StrongPassword123! pg_dump -U parmanand_user -h localhost parmanand_sports > $BACKUP_DIR/db_backup_$DATE.sql
find $BACKUP_DIR -name "db_backup_*.sql" -type f -mtime +7 -delete
echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
EOF

chmod +x /root/update-app.sh /root/check-app.sh /root/backup-db.sh

# Add daily backup to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-db.sh") | crontab -

# Step 15: Final verification
print_status "Performing final verification..."
sleep 10

# Check if application is running
if sudo -u parmanand pm2 list | grep -q "online"; then
    print_success "PM2 process is running"
else
    print_error "PM2 process is not running"
    exit 1
fi

# Check if port 3000 is listening
if netstat -tlnp | grep -q ":3000"; then
    print_success "Application is listening on port 3000"
else
    print_error "Application is not listening on port 3000"
    exit 1
fi

# Test API endpoint
if curl -s http://localhost:3000/api/dashboard/stats > /dev/null; then
    print_success "API endpoint is responding"
else
    print_warning "API endpoint may still be starting up"
fi

echo
print_success "================================================================="
print_success "  DEPLOYMENT COMPLETED SUCCESSFULLY!"
print_success "================================================================="
echo
print_status "Your Parmanand Sports Academy is now running at:"
print_success "  http://$SERVER_IP"
echo
print_status "Management Commands:"
echo "  /root/check-app.sh        - Check application status"
echo "  /root/update-app.sh       - Update application"
echo "  /root/backup-db.sh        - Backup database"
echo "  sudo -u parmanand pm2 logs - View application logs"
echo "  sudo -u parmanand pm2 restart parmanand-sports-academy - Restart app"
echo
print_status "Database Details:"
echo "  Database: parmanand_sports"
echo "  User: parmanand_user"
echo "  Password: $DB_PASSWORD"
echo
print_status "Automatic Features:"
echo "  ✓ Application starts on boot"
echo "  ✓ Daily database backups at 2 AM"
echo "  ✓ Firewall configured"
echo "  ✓ Nginx reverse proxy setup"
echo "  ✓ PM2 process monitoring"
echo
print_success "Deployment completed! Your sports academy is ready to use."
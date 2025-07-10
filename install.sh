#!/bin/bash

# Parmanand Sports Academy - One-Line VPS Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/your-repo/main/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="parmanand-sports-academy"
APP_USER="parmanand"
APP_DIR="/home/${APP_USER}/${APP_NAME}"
REPO_URL="https://github.com/your-username/parmanand-sports-academy.git"
NODE_VERSION="20"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons"
        print_status "Please run as a regular user with sudo privileges"
        exit 1
    fi
}

# Get user input for configuration
get_user_input() {
    echo
    print_status "=== Parmanand Sports Academy Installation ==="
    echo
    
    # Domain name
    read -p "Enter your domain name (e.g., sports.example.com): " DOMAIN_NAME
    if [[ -z "$DOMAIN_NAME" ]]; then
        print_error "Domain name is required"
        exit 1
    fi
    
    # Database password
    read -s -p "Enter a secure database password: " DB_PASSWORD
    echo
    if [[ -z "$DB_PASSWORD" ]]; then
        print_error "Database password is required"
        exit 1
    fi
    
    # Session secret
    SESSION_SECRET=$(openssl rand -base64 32)
    
    # API Keys (optional)
    echo
    print_status "Optional API Keys (press Enter to skip):"
    read -p "Google Gemini API Key (for AI features): " GEMINI_API_KEY
    read -p "WhatsApp API Key (for notifications): " WHATSAPP_API_KEY
    read -p "Stripe Secret Key (for payments): " STRIPE_SECRET_KEY
    read -p "Stripe Public Key: " STRIPE_PUBLIC_KEY
    
    echo
    print_status "Configuration completed!"
}

# Update system
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common build-essential
    print_success "System updated successfully"
}

# Install Node.js
install_nodejs() {
    print_status "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install global packages
    sudo npm install -g pm2 tsx typescript
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    print_success "Node.js ${node_version} and npm ${npm_version} installed"
}

# Install PostgreSQL
install_postgresql() {
    print_status "Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    
    # Start PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE parmanand_sports;"
    sudo -u postgres psql -c "CREATE USER parmanand_user WITH PASSWORD '${DB_PASSWORD}';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE parmanand_sports TO parmanand_user;"
    sudo -u postgres psql -c "ALTER USER parmanand_user CREATEDB;"
    
    print_success "PostgreSQL installed and configured"
}

# Install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx installed"
}

# Install SSL Certificate
install_ssl() {
    print_status "Installing SSL certificate..."
    sudo apt install -y certbot python3-certbot-nginx
    
    # Get SSL certificate
    sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
    
    print_success "SSL certificate installed"
}

# Create application user
create_app_user() {
    print_status "Creating application user..."
    if ! id "$APP_USER" &>/dev/null; then
        sudo adduser --disabled-password --gecos "" $APP_USER
        sudo usermod -aG sudo $APP_USER
        print_success "User $APP_USER created"
    else
        print_warning "User $APP_USER already exists"
    fi
}

# Clone and setup application
setup_application() {
    print_status "Setting up application..."
    
    # Switch to app user
    sudo -u $APP_USER bash << EOF
    cd /home/$APP_USER
    
    # Clone repository
    if [[ ! -d "$APP_NAME" ]]; then
        git clone $REPO_URL $APP_NAME
        cd $APP_NAME
    else
        cd $APP_NAME
        git pull origin main
    fi
    
    # Install dependencies
    npm install
    
    # Build application
    npm run build
EOF
    
    print_success "Application setup completed"
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    sudo -u $APP_USER bash << EOF
cat > $APP_DIR/.env << EOL
# Database Configuration
DATABASE_URL=postgresql://parmanand_user:${DB_PASSWORD}@localhost:5432/parmanand_sports
PGHOST=localhost
PGPORT=5432
PGUSER=parmanand_user
PGPASSWORD=${DB_PASSWORD}
PGDATABASE=parmanand_sports

# Application Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=${SESSION_SECRET}

# API Keys
GEMINI_API_KEY=${GEMINI_API_KEY}
WHATSAPP_API_KEY=${WHATSAPP_API_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
VITE_STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}

# Security
CORS_ORIGIN=https://${DOMAIN_NAME}
ALLOWED_ORIGINS=https://${DOMAIN_NAME},https://www.${DOMAIN_NAME}
EOL
EOF
    
    print_success "Environment file created"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    sudo -u $APP_USER bash << EOF
    cd $APP_DIR
    npm run db:push
EOF
    
    print_success "Database setup completed"
}

# Create PM2 ecosystem file
create_pm2_config() {
    print_status "Creating PM2 configuration..."
    
    sudo -u $APP_USER bash << EOF
cat > $APP_DIR/ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: '$APP_NAME',
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
EOL

# Create logs directory
mkdir -p $APP_DIR/logs
EOF
    
    print_success "PM2 configuration created"
}

# Configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    sudo bash << EOF
cat > /etc/nginx/sites-available/$APP_NAME << EOL
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubdomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # API and WebSocket routes
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
    }
    
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
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
    }
}
EOL

# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
EOF
    
    print_success "Nginx configured"
}

# Start application
start_application() {
    print_status "Starting application..."
    
    sudo -u $APP_USER bash << EOF
    cd $APP_DIR
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup
EOF
    
    # Configure PM2 startup
    PM2_STARTUP_CMD=$(sudo -u $APP_USER pm2 startup | grep "sudo")
    eval $PM2_STARTUP_CMD
    
    print_success "Application started"
}

# Setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    
    print_success "Firewall configured"
}

# Create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    sudo -u $APP_USER bash << EOF
cat > /home/$APP_USER/backup-db.sh << EOL
#!/bin/bash
BACKUP_DIR="/home/$APP_USER/backups"
DATE=\$(date +"%Y%m%d_%H%M%S")
DB_NAME="parmanand_sports"
DB_USER="parmanand_user"

mkdir -p \$BACKUP_DIR
pg_dump -U \$DB_USER -h localhost \$DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql
find \$BACKUP_DIR -name "db_backup_*.sql" -type f -mtime +7 -delete

echo "Database backup completed: \$BACKUP_DIR/db_backup_\$DATE.sql"
EOL

chmod +x /home/$APP_USER/backup-db.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$APP_USER/backup-db.sh") | crontab -
EOF
    
    print_success "Backup script created"
}

# Main installation function
main() {
    echo
    print_status "=========================================="
    print_status "  Parmanand Sports Academy Installer"
    print_status "=========================================="
    echo
    
    check_root
    get_user_input
    
    print_status "Starting installation..."
    echo
    
    update_system
    install_nodejs
    install_postgresql
    install_nginx
    create_app_user
    setup_application
    create_env_file
    setup_database
    create_pm2_config
    install_ssl
    configure_nginx
    start_application
    setup_firewall
    create_backup_script
    
    echo
    print_success "=========================================="
    print_success "  Installation completed successfully!"
    print_success "=========================================="
    echo
    print_status "Your sports academy is now running at:"
    print_success "https://$DOMAIN_NAME"
    echo
    print_status "Application logs: pm2 logs $APP_NAME"
    print_status "Application status: pm2 status"
    print_status "Restart application: pm2 restart $APP_NAME"
    echo
    print_status "Database backups are scheduled daily at 2 AM"
    print_status "Manual backup: /home/$APP_USER/backup-db.sh"
    echo
    print_warning "Don't forget to:"
    print_warning "1. Point your domain DNS to this server's IP"
    print_warning "2. Configure your API keys in the admin panel"
    print_warning "3. Test all functionality"
    echo
}

# Run main function
main "$@"
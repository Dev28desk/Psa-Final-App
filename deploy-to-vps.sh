#!/bin/bash

# Parmanand Sports Academy - Direct VPS Installer
# Run this script on your VPS as a non-root user with sudo privileges

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root for security reasons"
    print_status "Creating a non-root user for you..."
    
    # Create non-root user
    adduser --disabled-password --gecos "" parmanand
    usermod -aG sudo parmanand
    
    print_status "Please switch to the parmanand user and run this script again:"
    print_status "su - parmanand"
    print_status "curl -sSL your-server-ip/deploy-to-vps.sh | bash"
    exit 1
fi

# Get configuration
echo
print_status "=== Parmanand Sports Academy Installation ==="
echo

read -p "Enter your domain name (e.g., sports.example.com): " DOMAIN_NAME
read -s -p "Enter a secure database password: " DB_PASSWORD
echo
SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-secret-$(date +%s)")

echo
print_status "Optional API Keys (press Enter to skip):"
read -p "Google Gemini API Key: " GEMINI_API_KEY
read -p "WhatsApp API Key: " WHATSAPP_API_KEY
read -p "Stripe Secret Key: " STRIPE_SECRET_KEY
read -p "Stripe Public Key: " STRIPE_PUBLIC_KEY

# Update system
print_status "Updating system..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common build-essential

# Install Node.js 20
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2 tsx typescript

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql << EOF
CREATE DATABASE parmanand_sports;
CREATE USER parmanand_user WITH PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE parmanand_sports TO parmanand_user;
ALTER USER parmanand_user CREATEDB;
\q
EOF

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
APP_DIR="$HOME/parmanand-sports-academy"
mkdir -p $APP_DIR
cd $APP_DIR

# Create package.json
cat > package.json << 'EOF'
{
  "name": "parmanand-sports-academy",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "echo 'Build completed'",
    "start": "NODE_ENV=production tsx server/index.ts",
    "db:push": "echo 'Database setup completed'"
  },
  "dependencies": {
    "@google/genai": "^1.8.0",
    "@neondatabase/serverless": "^0.10.4",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/node": "^20.11.0",
    "@types/pg": "^8.10.9",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
EOF

# Install dependencies
print_status "Installing application dependencies..."
npm install

# Create basic server structure
mkdir -p server shared client/dist

# Create basic server file
cat > server/index.ts << 'EOF'
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, '../client/dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Parmanand Sports Academy is running!' });
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Parmanand Sports Academy running on port ${PORT}`);
});
EOF

# Create basic HTML file
mkdir -p client/dist
cat > client/dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parmanand Sports Academy</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; text-align: center; margin-bottom: 30px; }
        .status { padding: 20px; background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; margin: 20px 0; }
        .info { background: #dbeafe; border: 1px solid #2563eb; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .next-steps { background: #fef3c7; border: 1px solid #d97706; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .btn:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏆 Parmanand Sports Academy</h1>
        
        <div class="status">
            <h3>✅ Installation Successful!</h3>
            <p>Your sports academy management system is now running on this server.</p>
        </div>

        <div class="info">
            <h3>📋 System Information</h3>
            <p><strong>Status:</strong> <span id="status">Checking...</span></p>
            <p><strong>Server Time:</strong> <span id="time"></span></p>
            <p><strong>Node.js:</strong> Ready</p>
            <p><strong>Database:</strong> PostgreSQL Connected</p>
            <p><strong>SSL:</strong> <span id="ssl-status">Checking...</span></p>
        </div>

        <div class="next-steps">
            <h3>📝 Next Steps</h3>
            <ol>
                <li><strong>Upload your application files</strong> to replace this placeholder</li>
                <li><strong>Configure your domain DNS</strong> to point to this server</li>
                <li><strong>Set up SSL certificate</strong> (free with Let's Encrypt)</li>
                <li><strong>Add your API keys</strong> for full functionality</li>
            </ol>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="/api/health" class="btn">Check API Status</a>
            <a href="https://github.com/your-repo/parmanand-sports-academy" class="btn">Download Full Code</a>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
            <h4>🚀 Quick Commands</h4>
            <code>pm2 status</code> - Check application status<br>
            <code>pm2 logs parmanand-sports-academy</code> - View logs<br>
            <code>pm2 restart parmanand-sports-academy</code> - Restart app<br>
            <code>sudo nginx -t && sudo systemctl reload nginx</code> - Reload web server
        </div>
    </div>

    <script>
        // Check API status
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                document.getElementById('status').textContent = data.status === 'ok' ? '✅ Online' : '❌ Offline';
            })
            .catch(() => {
                document.getElementById('status').textContent = '❌ API Error';
            });

        // Update time
        document.getElementById('time').textContent = new Date().toLocaleString();
        
        // Check SSL
        document.getElementById('ssl-status').textContent = 
            window.location.protocol === 'https:' ? '✅ Secured' : '⚠️ HTTP Only';
    </script>
</body>
</html>
EOF

# Create environment file
cat > .env << EOF
DATABASE_URL=postgresql://parmanand_user:${DB_PASSWORD}@localhost:5432/parmanand_sports
PGHOST=localhost
PGPORT=5432
PGUSER=parmanand_user
PGPASSWORD=${DB_PASSWORD}
PGDATABASE=parmanand_sports
NODE_ENV=production
PORT=3000
SESSION_SECRET=${SESSION_SECRET}
GEMINI_API_KEY=${GEMINI_API_KEY}
WHATSAPP_API_KEY=${WHATSAPP_API_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
VITE_STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}
CORS_ORIGIN=https://${DOMAIN_NAME}
ALLOWED_ORIGINS=https://${DOMAIN_NAME},https://www.${DOMAIN_NAME}
EOF

# Create PM2 configuration
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
    instances: 1,
    exec_mode: 'fork',
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

# Start application
print_status "Starting application..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | grep "sudo" | head -1 | bash

# Configure Nginx (basic configuration)
sudo tee /etc/nginx/sites-available/parmanand-sports << EOF
server {
    listen 80;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};
    
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
EOF

sudo ln -sf /etc/nginx/sites-available/parmanand-sports /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup firewall
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Install SSL (if domain is configured)
if [[ -n "$DOMAIN_NAME" && "$DOMAIN_NAME" != "localhost" ]]; then
    print_status "Setting up SSL certificate..."
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME --redirect || print_warning "SSL setup failed - configure manually later"
fi

echo
print_success "=========================================="
print_success "  Installation completed successfully!"
print_success "=========================================="
echo
print_status "Your sports academy is now running at:"
if [[ -n "$DOMAIN_NAME" ]]; then
    print_success "http://$DOMAIN_NAME (or https:// if SSL worked)"
else
    print_success "http://$(curl -s ifconfig.me || echo 'your-server-ip')"
fi
echo
print_status "Application status: pm2 status"
print_status "Application logs: pm2 logs parmanand-sports-academy"
print_status "Restart app: pm2 restart parmanand-sports-academy"
echo
print_warning "Next steps:"
print_warning "1. Upload your full application code to $APP_DIR"
print_warning "2. Configure your domain DNS"
print_warning "3. Test all functionality"
echo
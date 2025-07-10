# One-Line VPS Installation

## Prerequisites
- Fresh Ubuntu 22.04 VPS
- Domain name pointed to your server IP
- Non-root user with sudo privileges

## Installation Command

```bash
curl -fsSL https://raw.githubusercontent.com/your-username/parmanand-sports-academy/main/install.sh | bash
```

## What This Command Does

The installation script automatically:

1. **Updates your system** and installs dependencies
2. **Installs Node.js 20** and PM2 process manager
3. **Sets up PostgreSQL** database with secure configuration
4. **Installs Nginx** web server with SSL support
5. **Clones and builds** your application
6. **Configures environment** variables securely
7. **Sets up SSL certificate** (free Let's Encrypt)
8. **Configures firewall** for security
9. **Creates backup scripts** for database
10. **Starts your application** in production mode

## During Installation

You'll be prompted for:
- **Domain name** (e.g., sports.yourdomain.com)
- **Database password** (choose a strong password)
- **API keys** (optional - can be added later)

## After Installation

Your sports academy will be live at:
```
https://yourdomain.com
```

## Management Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs parmanand-sports-academy

# Restart application
pm2 restart parmanand-sports-academy

# Manual database backup
/home/parmanand/backup-db.sh
```

## Estimated Installation Time
- **5-10 minutes** on a decent VPS
- Automatic SSL certificate setup
- Ready for production use

## Cost Breakdown
- **VPS**: $10-20/month (4GB RAM recommended)
- **Domain**: $10-15/year
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$15-30/month

## Alternative: Manual Installation

If you prefer step-by-step manual installation, use:
```bash
# Download the full deployment guide
wget https://raw.githubusercontent.com/your-username/parmanand-sports-academy/main/VPS_DEPLOYMENT_GUIDE.md
```

## Troubleshooting

If installation fails:
1. Check you have sudo privileges
2. Ensure domain DNS is pointed to server
3. Verify Ubuntu 22.04 LTS is being used
4. Check server has minimum 4GB RAM

## Security Features

The installer automatically:
- ✅ Configures UFW firewall
- ✅ Sets up SSL certificates
- ✅ Enables security headers
- ✅ Creates non-root application user
- ✅ Schedules daily database backups

Your sports academy will be production-ready and secure!
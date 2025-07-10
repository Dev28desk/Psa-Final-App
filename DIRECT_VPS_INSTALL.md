# Direct VPS Installation Guide

Since you're on your VPS already, here are **3 simple ways** to install:

## Method 1: Copy & Paste Script (Recommended)

**Step 1:** Create the installer script on your server:
```bash
nano install-sports-academy.sh
```

**Step 2:** Copy the entire script from `deploy-to-vps.sh` (in this project) and paste it

**Step 3:** Make it executable and run:
```bash
chmod +x install-sports-academy.sh
./install-sports-academy.sh
```

## Method 2: Direct Download (if you have the code uploaded)

If you've uploaded your project files to GitHub:
```bash
# Replace with your actual GitHub URL
wget https://raw.githubusercontent.com/your-username/your-repo/main/deploy-to-vps.sh
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

## Method 3: Manual Step-by-Step

If you prefer manual installation, run these commands one by one:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common build-essential

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2 tsx typescript

# 3. Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Create database (you'll need to set a password)
sudo -u postgres createdb parmanand_sports
sudo -u postgres createuser parmanand_user
sudo -u postgres psql -c "ALTER USER parmanand_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE parmanand_sports TO parmanand_user;"

# 5. Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 6. Create your application directory
mkdir -p ~/parmanand-sports-academy
cd ~/parmanand-sports-academy

# 7. Upload/clone your application code here
# Then continue with PM2 setup...
```

## Important Security Note

I noticed you're running as root. For production servers, it's better to:

1. **Create a non-root user:**
```bash
adduser parmanand
usermod -aG sudo parmanand
su - parmanand
```

2. **Then run the installation as the non-root user**

## What You'll Get

After installation:
- ✅ Node.js 20 + PM2 process manager  
- ✅ PostgreSQL database ready
- ✅ Nginx web server configured
- ✅ Basic firewall setup
- ✅ SSL certificate (if domain configured)
- ✅ Application running on port 3000

## Quick Test

After installation, test if it's working:
```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok","message":"Parmanand Sports Academy is running!"}`

## Estimated Time
- **5-15 minutes** depending on your server speed
- Most time spent on package downloads and updates

Choose the method that works best for you!
# Metal Vault - PM2 Deployment Guide

## Overview
This application uses PM2 to manage two separate processes:
- **metal-vault-app**: Next.js web application (port 3000)
- **metal-vault-worker**: GraphQL worker for background tasks (email newsletters, data syncing)

## Prerequisites
1. Node.js installed on your VPS
2. PM2 installed globally: `npm install -g pm2`  
3. Your application built for production: `npm run build`
4. Environment variables properly configured (DATABASE_URL, etc.)

## Quick Start

### 1. Deploy and Start Both Services
```bash
# Upload your code to VPS and install dependencies
npm install --production

# Start both applications
pm2 start ecosystem.config.js

# Save PM2 configuration (survives server restarts)
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 2. Using the Management Scripts

**PowerShell (Windows development):**
```powershell
# Start both services
.\pm2-manage.ps1 -Action start

# Check status
.\pm2-manage.ps1 -Action status

# View logs
.\pm2-manage.ps1 -Action logs
.\pm2-manage.ps1 -Action logs -AppName metal-vault-worker

# Restart services (after code updates)
.\pm2-manage.ps1 -Action restart
```

**Bash (Linux VPS):**
```bash
# Make script executable
chmod +x pm2-manage.sh

# Start both services
./pm2-manage.sh start

# Check status
./pm2-manage.sh status

# View logs
./pm2-manage.sh logs
./pm2-manage.sh logs metal-vault-worker

# Restart services (after code updates)
./pm2-manage.sh restart
```

## Individual PM2 Commands

### Managing Applications
```bash
# Start both apps
pm2 start ecosystem.config.js

# Stop both apps
pm2 stop ecosystem.config.js

# Restart both apps
pm2 restart ecosystem.config.js

# Delete both apps from PM2
pm2 delete ecosystem.config.js

# Start/stop individual apps
pm2 start metal-vault-app
pm2 stop metal-vault-worker
```

### Monitoring & Logs
```bash
# List all processes
pm2 list

# Monitor resources
pm2 monit

# View logs
pm2 logs                    # All apps
pm2 logs metal-vault-app    # Web app only
pm2 logs metal-vault-worker # Worker only

# View logs with tail
pm2 logs --lines 50

# Clear logs
pm2 flush
```

## Configuration Details

### Ecosystem Configuration (`ecosystem.config.js`)
- **Next.js App**: Runs on port 3000, 1GB memory limit
- **Worker**: Background service, 512MB memory limit  
- **Logs**: Stored in `./logs/` directory
- **Auto-restart**: Both services restart on crashes
- **Environment**: Production mode

### Worker Process
The worker runs continuously and handles:
- **Email newsletters**: Weekly (Saturday 9 AM) and Monthly (1st @ 9 AM)
- **Data syncing**: Band data from Metal Archives (Sunday 3 AM)
- **Background jobs**: Queued via GraphQL worker

### Testing Worker
```bash
# Run worker once (for testing)
npm run worker:once

# Or using management script
./pm2-manage.sh worker-once
```

## Nginx Configuration
Only the Next.js app needs nginx configuration. The worker is a background service.

```nginx
server {
    listen 80;
    server_name yourdomain.com;

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

## Deployment Workflow

### 1. Initial Deployment
```bash
# On your VPS
git clone <your-repo>
cd metal-vault
npm install --production
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Updates/Redeployment
```bash
# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install --production

# Rebuild application
npm run build

# Restart services
pm2 restart ecosystem.config.js
```

## Troubleshooting

### Check Process Status
```bash
pm2 list
pm2 show metal-vault-app
pm2 show metal-vault-worker
```

### View Logs
```bash
# Recent logs
pm2 logs --lines 100

# Live log monitoring
pm2 logs

# Specific app logs
pm2 logs metal-vault-worker --lines 50
```

### Common Issues
1. **Worker not processing jobs**: Check DATABASE_URL environment variable
2. **Memory issues**: Adjust `max_memory_restart` in ecosystem.config.js
3. **Port conflicts**: Ensure port 3000 is available for Next.js app
4. **Email tasks failing**: Verify AWS SES credentials in environment

### Environment Variables
Ensure these are set in your VPS environment:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
# ... other required vars
```

## Process Management

### Server Restart Survival
```bash
# Save current PM2 processes
pm2 save

# Generate startup script (run once)
pm2 startup

# This will give you a command to run as root/sudo
# Follow the instructions provided by the command
```

### Memory Management
Both processes have memory limits:
- Web app: 1GB (will restart if exceeded)
- Worker: 512MB (will restart if exceeded)

Adjust these in `ecosystem.config.js` based on your VPS resources.

## Security Notes
- The worker process doesn't expose any HTTP ports
- Only the Next.js app needs to be accessible via nginx
- Log files contain sensitive information - ensure proper permissions
- Consider log rotation for production environments

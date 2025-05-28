# La Lista Deployment Guide

## Server Requirements

### 1. System Requirements
- Ubuntu 20.04 LTS or later
- Node.js v18 or later
- PostgreSQL 14 or later
- Nginx
- PM2 (for process management)

### 2. Installation Steps

#### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib
```

#### Install Nginx
```bash
sudo apt install nginx
```

#### Install PM2
```bash
sudo npm install -g pm2
```

### 3. Database Setup

```bash
sudo -u postgres psql
CREATE DATABASE la_lista_db;
CREATE USER la_lista_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE la_lista_db TO la_lista_user;
```

### 4. Application Deployment

1. Clone the repository:
```bash
git clone <your-repository-url>
cd la-lista
```

2. Install dependencies:
```bash
# Server
cd server
npm install
npm run build

# Client
cd ../client
npm install
npm run build
```

3. Configure environment variables:
```bash
# Server
cp .env.example .env.production
# Edit .env.production with your production values
```

4. Set up PM2:
```bash
cd server
pm2 start dist/index.js --name la-lista-server
pm2 save
```

5. Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/la-lista
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Client
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Server API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/la-lista /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Setup (Recommended)

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

Get SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

### 6. Monitoring and Maintenance

- Monitor logs:
```bash
pm2 logs la-lista-server
```

- Monitor application:
```bash
pm2 monit
```

- Restart application:
```bash
pm2 restart la-lista-server
```

### 7. Backup Strategy

1. Database backups:
```bash
pg_dump -U la_lista_user la_lista_db > backup.sql
```

2. Application files:
```bash
tar -czf la-lista-backup.tar.gz /path/to/la-lista
```

## Recommended Cloud Services

### AWS Setup
1. EC2 Instance (t2.micro or better)
2. RDS for PostgreSQL
3. S3 for file storage
4. Route 53 for DNS
5. CloudFront for CDN

### DigitalOcean Setup
1. Droplet (Basic plan or better)
2. Managed Database for PostgreSQL
3. Spaces for file storage
4. Load Balancer (optional)

### Heroku Setup
1. Heroku Dyno (Standard-1x or better)
2. Heroku Postgres
3. Heroku Scheduler for cron jobs
4. Heroku Redis (if needed)

## Security Considerations

1. Keep all dependencies updated
2. Use strong passwords
3. Enable firewall (UFW)
4. Regular security updates
5. SSL/TLS encryption
6. Database backups
7. Rate limiting
8. Input validation
9. XSS protection
10. CSRF protection

## Monitoring and Alerts

1. Set up PM2 monitoring
2. Configure error logging
3. Set up uptime monitoring
4. Configure backup alerts
5. Set up performance monitoring

## Scaling Considerations

1. Load balancing
2. Database replication
3. Caching strategy
4. CDN implementation
5. Horizontal scaling

# Deployment Guide for DigitalOcean

## Prerequisites
- DigitalOcean account
- Domain name (optional)
- PostgreSQL database (can be created on DigitalOcean)

## Deployment Steps

### 1. Database Setup
1. Create a PostgreSQL database on DigitalOcean
   - Go to Databases > Create Database Cluster
   - Choose PostgreSQL
   - Select a plan (Basic is fine for development)
   - Choose a datacenter region close to your users
   - Create the database

2. Get the database connection details
   - Note down the host, port, database name, username, and password
   - These will be used in your environment variables

### 2. Server Deployment
1. Create a new Droplet
   - Choose Ubuntu 22.04 LTS
   - Select a plan (Basic is fine for development)
   - Choose a datacenter region
   - Add your SSH key
   - Create the Droplet

2. Connect to your Droplet
```bash
ssh root@your-droplet-ip
```

3. Install Node.js and npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. Install PM2 (process manager)
```bash
sudo npm install -g pm2
```

5. Clone your repository
```bash
git clone https://github.com/egalvanrios/la-lista-2025.git
cd la-lista-2025
```

6. Set up environment variables
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials and other settings
```

7. Install dependencies and build
```bash
npm install
npm run build
```

8. Start the server with PM2
```bash
pm2 start dist/index.js --name "la-lista-server"
pm2 save
```

### 3. Frontend Deployment
1. Build the frontend
```bash
cd ../client
npm install
npm run build
```

2. Install Nginx
```bash
sudo apt-get update
sudo apt-get install nginx
```

3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/la-lista
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Frontend
    location / {
        root /root/la-lista-2025/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/la-lista /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Setup (Optional but Recommended)
1. Install Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. Get SSL certificate
```bash
sudo certbot --nginx -d your-domain.com
```

### 5. Monitoring and Maintenance
1. Monitor your application
```bash
pm2 monit
```

2. View logs
```bash
pm2 logs la-lista-server
```

3. Restart application
```bash
pm2 restart la-lista-server
```

## Environment Variables
Make sure to set these environment variables in your server's `.env` file:

```env
# Database
DB_HOST=your-db-host
DB_PORT=your-db-port
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Server
PORT=3000
NODE_ENV=production
JWT_SECRET=your-jwt-secret

# Client API URL
CLIENT_API_URL=https://your-domain.com/api
```

## Troubleshooting
1. Check server logs:
```bash
pm2 logs la-lista-server
```

2. Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

3. Check application status:
```bash
pm2 status
```

4. Restart services:
```bash
sudo systemctl restart nginx
pm2 restart all
``` 
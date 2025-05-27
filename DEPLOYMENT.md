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
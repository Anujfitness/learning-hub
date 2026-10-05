# Deployment Guide: Study Playlist on AWS EC2 with Docker

This guide walks you through deploying the **Study Playlist** application to an **AWS EC2** instance using Docker and Docker Compose.

---

## 1. Prerequisites
- An AWS Account.
- EC2 Instance: **t3.micro** or **t3.small** (Ubuntu 24.04 LTS or Amazon Linux 2023).
- EC2 Security Group configured with:
  - **Inbound Rule**: Port `22` (SSH) — your IP
  - **Inbound Rule**: Port `80` (HTTP) — `0.0.0.0/0`
  - **Inbound Rule**: Port `443` (HTTPS) — `0.0.0.0/0`
  - **Inbound Rule**: Port `3000` (Direct app access) — `0.0.0.0/0`

---

## 2. Connect to your EC2 Instance
```bash
ssh -i /path/to/your-key.pem ubuntu@<your-ec2-public-ip>
```

---

## 3. Install Docker & Docker Compose
On Ubuntu 24.04:
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow running docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

## 4. Deploy Study Playlist

### Option A: Using Docker Compose (Recommended)
1. Clone or copy the project to your EC2 instance:
```bash
git clone <your-repository-url> /app/study-playlist
cd /app/study-playlist
```

2. Build and launch the container in detached mode:
```bash
docker compose up -d --build
```

3. Verify container is healthy and running:
```bash
docker compose ps
docker compose logs -f
```

The app will now be accessible at `http://<your-ec2-public-ip>:3000`.

---

### Option B: Standalone Docker Run
```bash
# Build the image
docker build -t study-playlist:latest .

# Run with persistent volume for data
docker run -d \
  --name study-playlist \
  --restart unless-stopped \
  -p 3000:3000 \
  -v study_playlist_data:/app/data \
  study-playlist:latest
```

---

## 5. Setting up Nginx Reverse Proxy & SSL (Port 80/443)
To serve on port 80/443 with a custom domain and free Let's Encrypt SSL certificate:

1. Install Nginx and Certbot:
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

2. Create an Nginx config: `/etc/nginx/sites-available/studyplaylist`
```nginx
server {
    listen 80;
    server_name studyplaylist.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Enable the site and obtain SSL:
```bash
sudo ln -s /etc/nginx/sites-available/studyplaylist /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Run certbot to automate SSL certificate issuance
sudo certbot --nginx -d studyplaylist.yourdomain.com
```

---

## 6. Backups & Data Persistence
Data (user accounts, playlists, videos, progress, favorites) is stored in the Docker volume `study_playlist_data` mapped to `/app/data`.
To take an instant backup:
```bash
docker run --rm -v study_playlist_data:/data -v $(pwd):/backup alpine tar czf /backup/database-backup.tar.gz /data
```

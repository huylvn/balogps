# Hướng dẫn triển khai BaloGPS

BaloGPS có thể được triển khai bằng Docker (khuyến nghị) hoặc chạy thủ công.

## ⚡ Triển khai nhanh với Docker (Khuyến nghị)

### Yêu cầu
- **Docker Desktop** 20.10+ 
- **Docker Compose** 2.0+
- **Port 3000, 3443, 5433** không bị chiếm

### Bước 1: Cài Docker Desktop

**Windows:**
1. Tải từ: https://www.docker.com/products/docker-desktop/
2. Cài đặt và khởi động Docker Desktop
3. Đợi Docker Desktop hiển thị "Docker is running"

**Kiểm tra:**
```powershell
docker --version
docker-compose --version
```

### Bước 2: Deploy toàn bộ hệ thống

**PowerShell:**
```powershell
.\deploy.ps1
```

**Command Prompt:**
```cmd
deploy.bat
```

Script sẽ tự động:
- ✅ Tắt containers cũ (nếu có)
- ✅ Build Docker images (backend + frontend)
- ✅ Tạo PostgreSQL database
- ✅ Chạy migrations
- ✅ Generate SSL certificates
- ✅ Start tất cả services

### Bước 3: Truy cập ứng dụng

**Trên máy local:**
- HTTP: http://localhost:3000
- HTTPS: https://localhost:3443 ⭐ (khuyến nghị)

**Browser sẽ cảnh báo về self-signed certificate:**
- Click "Advanced" → "Proceed to localhost"

### Bước 4: Test với iPhone (optional)

```powershell
# Cài ngrok (nếu chưa có)
choco install ngrok
# hoặc tải từ: https://ngrok.com/download

# Tạo HTTPS tunnel
ngrok http 3443
```

Mở URL từ ngrok trên iPhone Safari.

---

## 📦 Chuyển sang máy khác

### Cách 1: Chuyển source code

**Trên máy hiện tại:**
```powershell
# Nén toàn bộ project (không bao gồm node_modules, build)
Compress-Archive -Path * -DestinationPath BaloGPS.zip -CompressionLevel Optimal
```

**Trên máy mới:**
1. Copy file `BaloGPS.zip` sang máy mới
2. Giải nén
3. Cài Docker Desktop
4. Chạy: `.\deploy.ps1` (PowerShell) hoặc `deploy.bat` (CMD)

### Cách 2: Export/Import Docker Images

**Trên máy hiện tại:**
```powershell
# Build images
docker-compose build

# Export images
docker save balogps-backend:latest | gzip > balogps-backend.tar.gz
docker save postgres:15-alpine | gzip > postgres.tar.gz

# Copy 3 files sang máy mới:
# - balogps-backend.tar.gz
# - postgres.tar.gz
# - docker-compose.yml
```

**Trên máy mới:**
```powershell
# Cài Docker Desktop

# Import images
docker load < balogps-backend.tar.gz
docker load < postgres.tar.gz

# Start containers
docker-compose up -d
```

### Cách 3: Docker Registry (nâng cao)

```powershell
# Tag images
docker tag balogps-backend:latest your-registry.com/balogps-backend:latest

# Push to registry
docker push your-registry.com/balogps-backend:latest

# Trên máy mới, pull và run
docker pull your-registry.com/balogps-backend:latest
docker-compose up -d
```

---

## 🔧 Các lệnh Docker hữu ích

```powershell
# Xem logs realtime
docker-compose logs -f

# Xem logs của backend
docker-compose logs -f backend

# Xem logs của database
docker-compose logs -f postgres

# Restart containers
docker-compose restart

# Stop containers (giữ data)
docker-compose stop

# Stop và xóa containers (mất data)
docker-compose down

# Stop và xóa containers + volumes (xóa database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Shell vào backend container
docker exec -it balogps-backend sh

# Shell vào database container
docker exec -it balogps-db psql -U postgres -d balogps

# Xem danh sách containers
docker-compose ps

# Xem tài nguyên sử dụng
docker stats
```

---

## 🐛 Troubleshooting Docker

### Lỗi: "Port already in use"

**Port 3443:**
```powershell
# Tìm process
netstat -ano | findstr :3443

# Kill process (thay PID)
taskkill /PID [PID] /F
```

**Port 5433:**
```powershell
# Stop PostgreSQL local nếu đang chạy
Stop-Service postgresql-x64-15
```

### Lỗi: "Cannot connect to Docker daemon"

```powershell
# Restart Docker Desktop
# Hoặc trong PowerShell:
Restart-Service docker
```

### Lỗi: Build failed

```powershell
# Xóa cache và rebuild
docker-compose build --no-cache
docker system prune -a
```

### Database bị lỗi

```powershell
# Reset database (MẤT DATA)
docker-compose down -v
docker-compose up -d
```

---

## 🔨 Development (không dùng Docker)

### Yêu cầu
- Node.js 18+
- PostgreSQL 15+
- OpenSSL

## Bước 1: Cài đặt dependencies

### Backend
```powershell
cd backend
npm install
```

### Frontend
```powershell
cd frontend
npm install
```

## Bước 2: Setup Database

### Cách 1: Dùng Docker (chỉ PostgreSQL)
```powershell
# Tại thư mục gốc
docker-compose up -d postgres

# Đợi PostgreSQL khởi động
Start-Sleep -Seconds 5
```

### Cách 2: Cài PostgreSQL thủ công
- Tải và cài PostgreSQL 15+ từ https://www.postgresql.org/download/windows/
- Tạo database:
```powershell
psql -U postgres
CREATE DATABASE balogps;
\q
```

## Bước 3: Generate SSL Certificates

```powershell
cd backend
npm run generate-cert
```

## Bước 4: Chạy Migration

```powershell
cd backend
node src/database/migrate.js
```

## Bước 5: Start Backend

```powershell
cd backend
npm start
```

Backend chạy trên:
- HTTP: http://localhost:3000
- HTTPS: https://localhost:3443

## Bước 6: Build và Deploy Frontend

```powershell
cd frontend
npm run build
Copy-Item -Path .\build -Destination ..\backend\ -Recurse -Force
```

Frontend sẽ được serve từ backend qua HTTPS.

---

## 🌍 Production Deployment

### Cấu hình Production

**1. Thay đổi JWT Secret:**
```powershell
# Tạo secret key mạnh
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host $secret

# Cập nhật trong docker-compose.yml
JWT_SECRET: your-generated-secret-here
```

**2. Sử dụng SSL Certificate thật:**

Nếu deploy lên server có domain:
```powershell
# Đặt certificate vào backend/ssl/
backend/ssl/server.crt  # Certificate
backend/ssl/server.key  # Private key

# Certificate từ Let's Encrypt, Cloudflare, v.v.
```

**3. Reverse Proxy (khuyến nghị):**

Dùng Nginx/Caddy làm reverse proxy:
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass https://localhost:3443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**4. Backup Strategy:**

```powershell
# Backup database
docker exec balogps-db pg_dump -U postgres balogps > backup.sql

# Restore database
docker exec -i balogps-db psql -U postgres balogps < backup.sql

# Scheduled backup (Windows Task Scheduler)
# Tạo script backup.ps1:
$date = Get-Date -Format "yyyy-MM-dd_HHmmss"
docker exec balogps-db pg_dump -U postgres balogps > "backup_$date.sql"
```

---

## 📊 Monitoring

### Xem tài nguyên

```powershell
# CPU, Memory usage
docker stats

# Disk usage
docker system df

# Logs với timestamp
docker-compose logs -f --timestamps
```

### Health Checks

```powershell
# Check backend health
curl http://localhost:3000/api/health

# Check database
docker exec balogps-db pg_isready -U postgres
```

---

## 🔐 Security Checklist

Khi deploy production:

- [ ] Đổi `JWT_SECRET` thành giá trị bảo mật mạnh
- [ ] Đổi database password (không dùng `postgres`)
- [ ] Sử dụng SSL certificate thật (từ Let's Encrypt)
- [ ] Đặt firewall rules cho ports
- [ ] Bật HTTPS only (tắt HTTP port 3000)
- [ ] Enable rate limiting
- [ ] Setup backup tự động
- [ ] Enable logging và monitoring
- [ ] Update Docker images thường xuyên
- [ ] Scan vulnerabilities: `docker scan balogps-backend`

---

## 📝 Environment Variables

Có thể override trong `docker-compose.yml`:

```yaml
environment:
  PORT: 3000                    # HTTP port
  HTTPS_PORT: 3443              # HTTPS port
  DATABASE_URL: postgresql://postgres:postgres@postgres:5432/balogps
  JWT_SECRET: your-secret-key   # ⚠️ ĐỔI TRONG PRODUCTION
  NODE_ENV: production
```

Hoặc dùng file `.env`:
```env
JWT_SECRET=your-super-secret-key-here
POSTGRES_PASSWORD=strong-password
```

---

## ⚙️ Advanced Configuration

### Tăng performance

**PostgreSQL tuning trong docker-compose.yml:**
```yaml
postgres:
  command: 
    - postgres
    - -c
    - shared_buffers=256MB
    - -c
    - max_connections=200
```

### Scaling

```powershell
# Chạy nhiều backend instances
docker-compose up -d --scale backend=3

# Cần load balancer (nginx) phía trước
```

### Custom network

Nếu có nhiều services khác:
```yaml
networks:
  balogps-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

---

## 📚 Tài liệu bổ sung

- [README.md](README.md) - Hướng dẫn sử dụng
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide  
- [CONTRIBUTING.md](CONTRIBUTING.md) - Đóng góp code
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

Backend sẽ chạy tại: http://localhost:3000/api

## Bước 5: Build Frontend

```powershell
cd frontend
npm run build
```

Files build sẽ được tạo tại `frontend/build/`

## Bước 6: Chạy toàn bộ với Docker (Khuyến nghị)

```powershell
# Tại thư mục gốc
docker-compose up --build
```

## Kiểm tra hệ thống

1. Backend health: http://localhost:3000/api/health
2. Frontend: http://localhost:3000
3. Tracker: http://localhost:3000/tracker.html

## Test với dữ liệu mẫu

### 1. Tạo tài khoản
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email_or_phone":"test@example.com","password":"123456"}'
```

### 2. Login
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email_or_phone":"test@example.com","password":"123456"}'
```

Lưu token từ response.

### 3. Tạo child
```powershell
$token = "your_jwt_token_here"
curl -X POST http://localhost:3000/api/children `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"name":"Bé An"}'
```

### 4. Tạo zone
```powershell
$childId = "child_id_from_previous_response"
curl -X POST http://localhost:3000/api/children/$childId/zones `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"name":"Nhà","center_lat":21.0285,"center_lng":105.8542,"radius_m":150}'
```

### 5. Tạo tracker token
```powershell
curl -X POST http://localhost:3000/api/children/$childId/tracker-token `
  -H "Authorization: Bearer $token"
```

## Production Deployment

### 1. Update .env với production values
```
PORT=3000
DATABASE_URL=postgresql://user:password@production-host:5432/balogps
JWT_SECRET=very-long-random-secret-key-here
NODE_ENV=production
```

### 2. Build frontend
```powershell
cd frontend
$env:REACT_APP_API_URL = "https://your-domain.com/api"
npm run build
```

### 3. Deploy với Docker
```powershell
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Setup Nginx reverse proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### 5. Setup SSL với Let's Encrypt
```powershell
certbot --nginx -d your-domain.com
```

## Monitoring

### View logs
```powershell
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# PostgreSQL only
docker-compose logs -f postgres
```

### Check database
```powershell
docker-compose exec postgres psql -U postgres -d balogps
```

```sql
-- Check tables
\dt

-- Check children
SELECT * FROM children;

-- Check zones
SELECT * FROM zones;

-- Check latest locations
SELECT * FROM location_points ORDER BY ts DESC LIMIT 10;

-- Check alerts
SELECT * FROM alerts ORDER BY ts DESC LIMIT 10;
```

## Backup Database

```powershell
docker-compose exec postgres pg_dump -U postgres balogps > backup.sql
```

## Restore Database

```powershell
Get-Content backup.sql | docker-compose exec -T postgres psql -U postgres balogps
```

## Troubleshooting

### Port 3000 đã bị sử dụng
```powershell
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### PostgreSQL không kết nối được
```powershell
# Check PostgreSQL status
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend không build được
```powershell
# Clear cache
cd frontend
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run build
```

## Các lệnh hữu ích

```powershell
# Stop all services
docker-compose down

# Remove all data
docker-compose down -v

# Rebuild and restart
docker-compose up --build --force-recreate

# View running containers
docker-compose ps

# Access backend container shell
docker-compose exec backend sh

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres balogps
```

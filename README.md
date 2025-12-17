# BaloGPS - Hệ thống theo dõi GPS

Hệ thống theo dõi vị trí GPS chạy hoàn toàn trên HTTPS. Laptop làm người theo dõi, iPhone là đối tượng bị theo dõi.

## 🚀 Quick Start với Docker

```powershell
# Cài Docker Desktop, sau đó chạy:
.\deploy.ps1          # PowerShell
# hoặc
deploy.bat            # Command Prompt
```

Truy cập: https://localhost:3443

📚 **Xem thêm:** [DOCKER.md](DOCKER.md) - Chạy project trên máy khác bằng Docker

## Tính năng

- ✅ Theo dõi vị trí GPS realtime
- ✅ Thiết lập vùng an toàn (bán kính tối thiểu 1m)
- ✅ Hỗ trợ nhiều vùng an toàn cho mỗi thiết bị
- ✅ Hiển thị trạng thái riêng cho từng vùng
- ✅ Cảnh báo khi ra khỏi vùng an toàn
- ✅ Cảnh báo khi trở lại vùng an toàn
- ✅ Bản đồ tổng quan hiển thị tất cả thiết bị
- ✅ Chạy hoàn toàn trên HTTPS (bắt buộc cho iPhone GPS)
- ✅ Deploy dễ dàng với Docker

## Yêu cầu hệ thống

- **Node.js** 18+
- **PostgreSQL** 15+ (Docker)
- **OpenSSL** (tạo SSL certificate)
- **iPhone** với Safari (đối tượng bị theo dõi)
- **Laptop** (người theo dõi)

## Khởi tạo từ đầu

### Bước 1: Cài đặt OpenSSL

**Windows - Chocolatey:**
```powershell
choco install openssl
```

**Windows - Scoop:**
```powershell
scoop install openssl
```

**Windows - Download:**
https://slproweb.com/products/Win32OpenSSL.html

### Bước 2: Reset và khởi tạo Database

```powershell
# Reset toàn bộ database
.\reset-backend.ps1
```

### Bước 3: Cài đặt Backend (HTTPS)

```powershell
cd backend

# Cài đặt dependencies
npm install

# Tạo SSL certificate cho HTTPS
npm run generate-cert

# Khởi động server HTTPS
npm start
```

**Backend chạy trên:**
- ✅ HTTPS: `https://localhost:3443` (chính)
- HTTP: `http://localhost:3000` (phụ)

### Bước 4: Cài đặt Frontend (HTTPS)

```powershell
cd frontend

# Cài đặt dependencies
npm install

# Build frontend (chờ build hoàn tất trước khi copy)
npm run build

# Sau khi build xong, copy build folder vào backend để serve qua HTTPS
Copy-Item -Path .\build -Destination ..\backend\ -Recurse -Force
```

**Lưu ý:** Đợi `npm run build` hoàn tất (thấy "The build folder is ready...") trước khi chạy lệnh Copy-Item.

**Frontend sẽ được serve qua HTTPS từ backend**

### Bước 5: Truy cập ứng dụng

**Trên Laptop:**
```
https://localhost:3443
```

Browser sẽ cảnh báo về self-signed certificate. Chọn "Advanced" → "Proceed to localhost".

## Test với iPhone (Bắt buộc HTTPS)

iPhone Safari yêu cầu HTTPS để sử dụng GPS.

### Sử dụng hai mạng riêng biệt (Khuyến nghị với ngrok)

Laptop và iPhone có thể ở hai mạng khác nhau (Laptop dùng WiFi nhà, iPhone dùng 4G/5G):

```powershell
# Terminal 1: Chạy backend trên laptop
cd backend
npm start

# Terminal 2: Tạo HTTPS tunnel công khai
ngrok http 3443
```

ngrok sẽ tạo URL HTTPS công khai (ví dụ: `https://abc123.ngrok.io`) có thể truy cập từ bất kỳ đâu.

**Trên Laptop:**
- Mở: `https://localhost:3443` (mạng nội bộ)
- Hoặc: `https://abc123.ngrok.io` (qua internet)

**Trên iPhone:**
- Mở Safari, truy cập: `https://abc123.ngrok.io` (qua 4G/5G hoặc WiFi bất kỳ)
- Không cần cùng mạng với laptop

### Cách khác: Cùng mạng WiFi (Phức tạp hơn)

Nếu muốn laptop và iPhone cùng WiFi:

1. Tạo certificate cho IP của laptop
2. Cài certificate vào iPhone
3. Trust certificate trong Settings
4. Truy cập `https://[LAPTOP_IP]:3443`

## Hướng dẫn sử dụng đầy đủ

### A. Trên Laptop (Người theo dõi)

**1. Truy cập ứng dụng**
```
https://localhost:3443
```
Hoặc URL ngrok nếu test với iPhone

**2. Đăng ký tài khoản**
- Click "Đăng ký"
- Nhập email và mật khẩu
- Đăng nhập

**3. Tạo thiết bị theo dõi**
- Click nút "+" ở góc dưới bên phải
- Nhập tên: "iPhone của con"
- Click "Tạo thiết bị"

**4. Kết nối thiết bị (BẮT BUỘC trước khi tạo vùng)**
- Click vào thiết bị vừa tạo
- Tab "Thiết lập" → "Tạo link tracker"
- Copy link và mở trên iPhone Safari
- Cấp quyền Location → Bắt đầu tracking
- ⚠️ **Quan trọng:** Phải kết nối thiết bị trước, sau đó mới tạo vùng an toàn

**5. Tạo vùng an toàn (sau khi đã kết nối thiết bị)**
- Quay lại thiết bị, tab "Vùng an toàn" → "Thêm vùng an toàn"
- **Chọn vị trí trung tâm:**
  - Click vào bản đồ để chọn thủ công
  - Hoặc click nút **"📍 Lấy vị trí hiện tại"** để dùng GPS của laptop
- Nhập tên vùng: "Nhà" hoặc "Trường học"
- Nhập bán kính: Tối thiểu 1m (khuyến nghị >= 10m)
- Click "Tạo vùng an toàn"
- **Có thể tạo nhiều vùng:** Lặp lại để thêm "Trường học", "Nhà ông bà", v.v.
- **Hệ thống tự động quét:** Thiết bị sẽ tự động được quét với TẤT CẢ các vùng an toàn

### B. Trên iPhone (Đối tượng bị theo dõi)

**1. Mở Tracker**
- Mở **Safari** trên iPhone (bắt buộc Safari, không dùng Chrome)
- Paste link tracker vừa copy
- Ví dụ: `https://abc123.ngrok.io/tracker.html?token=xxx`

**2. Cấp quyền Location**
- Safari sẽ hiện popup hỏi quyền Location
- Chọn **"Allow"** hoặc **"Allow While Using App"**

**3. Bắt đầu tracking**
- Click nút **"Bắt đầu theo dõi"**
- iPhone bắt đầu gửi vị trí GPS mỗi 10 giây
- Màn hình hiển thị:
  - Trạng thái: "Đang theo dõi" (xanh)
  - Vị trí GPS hiện tại
  - Số điểm đã gửi

### C. Kết quả trên Laptop

**📍 Bản đồ tổng quan:**
- Tab "Bản đồ" trên Dashboard hiển thị TẤT CẢ thiết bị
- Mỗi thiết bị hiển thị vị trí hiện tại (marker)
- Tất cả vùng an toàn được hiển thị (vòng tròn màu xanh)
- Click vào marker/zone để xem chi tiết

**✅ Khi iPhone TRONG vùng an toàn:**
- Status: "Trong vùng an toàn" (màu xanh)
- Vị trí hiển thị trên bản đồ
- Không có cảnh báo

**⚠️ Khi iPhone RA NGOÀI vùng an toàn:**
- Status chuyển: "Ngoài vùng an toàn" (màu đỏ)
- Cảnh báo popup: "Đã rời khỏi [Nhà]"
- Tab "Bản tin" hiển thị EXIT alert

**✅ Khi iPhone TRỞ LẠI vùng an toàn:**
- Status chuyển: "Trong vùng an toàn" (màu xanh)
- Cảnh báo popup: "Đã vào [Nhà]"
- Tab "Bản tin" hiển thị ENTER alert

**🔄 Quét tự động với nhiều zones:**
- Nếu có nhiều vùng (ví dụ: Nhà, Trường, Công viên)
- Hệ thống tự động quét TẤT CẢ các vùng
- Khi vào bất kỳ vùng nào → Cảnh báo ENTER
- Khi rời khỏi vùng cuối cùng → Cảnh báo EXIT

## Cấu hình

### Backend Environment (.env)
File `backend/.env` đã được cấu hình sẵn:
```env
PORT=3000
HTTPS_PORT=3443
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/balogps
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Frontend Environment
File `frontend/src/services/api.js` đã cấu hình mặc định HTTPS:
```javascript
const API_BASE_URL = 'https://localhost:3443/api';
```

## Các lệnh thường dùng

```powershell
# Reset toàn bộ (xóa DB, khởi tạo lại)
.\reset-backend.ps1

# Tạo/tạo lại SSL certificate
cd backend
npm run generate-cert

# Kiểm tra SSL certificate có tồn tại
Test-Path .\backend\ssl\server.crt
Test-Path .\backend\ssl\server.key

# Xem thông tin certificate (ngày hết hạn, domain, etc)
openssl x509 -in .\backend\ssl\server.crt -text -noout

# Xem ngày hết hạn certificate
openssl x509 -in .\backend\ssl\server.crt -noout -dates

# Khởi động backend (HTTPS)
cd backend
npm start

# Build frontend (chờ hoàn tất)
cd frontend
npm run build

# Sau khi build xong, copy vào backend
Copy-Item -Path .\frontend\build -Destination .\backend\ -Recurse -Force

# Test với ngrok
ngrok http 3443
```

## ⚠️ Lưu ý quan trọng

### 1. HTTPS là bắt buộc
- ✅ Backend chạy trên HTTPS (port 3443)
- ✅ Frontend được serve qua HTTPS
- ✅ Tracker chạy trên HTTPS
- ❌ HTTP không hoạt động với iPhone GPS

### 2. iPhone GPS Requirements
- **Bắt buộc Safari**: Không dùng Chrome iOS
- **Bắt buộc HTTPS**: Safari chặn GPS trên HTTP
- **Development**: Dùng ngrok (free & dễ)
- **Self-signed cert**: Không hoạt động với iPhone

### 3. Độ chính xác GPS
- Sai số thông thường: 5-15 mét
- Bán kính 1m: Có thể khó test do sai số
- **Khuyến nghị**: Bán kính >= 10m
- **Outdoor**: Chính xác hơn (5-10m)
- **Indoor**: Sai số cao hơn (20-50m)

### 4. Tần suất gửi GPS
- Mặc định: 10 giây/lần
- Tùy chỉnh: 5s, 15s, 30s, 60s
- Tần suất cao → Pin tụt nhanh
- Khuyến nghị: 10-15 giây

### 5. Certificate trong Browser
Khi truy cập `https://localhost:3443` lần đầu:
- Chrome/Edge: "Your connection is not private"
  - Click "Advanced" → "Proceed to localhost (unsafe)"
- Firefox: Click "Advanced" → "Accept the Risk and Continue"
- Safari: Click "Show Details" → "visit this website"

## Xử lý lỗi (Troubleshooting)

### Lỗi: "OpenSSL not found"
```powershell
# Cài OpenSSL
choco install openssl

# Restart PowerShell sau khi cài
```

### Lỗi: "Certificate not found"
```powershell
cd backend
npm run generate-cert
```

### Lỗi: iPhone không cho GPS
**Nguyên nhân:** Chưa dùng HTTPS

**Giải pháp:**
1. Dùng ngrok: `ngrok http 3443`
2. Mở URL HTTPS từ ngrok trên iPhone
3. Cấp quyền Location trong Safari

**Kiểm tra Settings:**
- Settings > Safari > Location = "Ask" hoặc "Allow"
- Settings > Privacy > Location Services = ON

### Lỗi: Không nhận cảnh báo
**Checklist:**
- [ ] Zone đã active?
- [ ] Di chuyển đủ xa (> bán kính)?
- [ ] GPS accuracy < 50m?
- [ ] Backend đang chạy?
- [ ] SSE connection OK? (F12 > Network tab)

**Debug:**
```powershell
# Xem backend logs
cd backend
npm start
# Để ý console log khi location update
```

### Lỗi: Database connection failed
```powershell
# Kiểm tra PostgreSQL
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# Reset toàn bộ
.\reset-backend.ps1
```

### Lỗi: Port 3443 already in use
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :3443

# Kill process (thay PID)
taskkill /PID [PID] /F
```

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────┐
│  Laptop (Người theo dõi)                │
│  https://localhost:3443                 │
│  - Đăng ký/Đăng nhập                    │
│  - Tạo thiết bị & vùng an toàn          │
│  - Xem vị trí realtime                  │
│  - Nhận cảnh báo EXIT/ENTER             │
└────────────┬────────────────────────────┘
             │ HTTPS
             │
┌────────────▼────────────────────────────┐
│  Backend Server (Node.js + Express)     │
│  https://localhost:3443                 │
│  - HTTPS Server (port 3443)             │
│  - HTTP Server (port 3000, phụ)         │
│  - REST API                             │
│  - SSE Realtime                         │
│  - Geofence Engine                      │
└────────────┬────────────────────────────┘
             │
             │
┌────────────▼────────────────────────────┐
│  PostgreSQL Database                    │
│  localhost:5433 (Docker)                │
│  - Users, Children, Zones               │
│  - Location history                     │
│  - Alerts                               │
└─────────────────────────────────────────┘
             ▲
             │ HTTPS
             │
┌────────────┴────────────────────────────┐
│  iPhone (Đối tượng bị theo dõi)         │
│  Safari                                 │
│  https://[ngrok-url]/tracker.html       │
│  - Gửi GPS mỗi 10 giây                  │
│  - Cấp quyền Location                   │
└─────────────────────────────────────────┘
```

## Database Schema

| Table | Mô tả |
|-------|-------|
| `users` | Tài khoản người theo dõi |
| `children` | Thiết bị bị theo dõi |
| `trackers` | Token xác thực tracker |
| `zones` | Vùng an toàn (hình tròn) |
| `location_points` | Lịch sử GPS |
| `geofence_state` | Trạng thái IN/OUT vùng |
| `alerts` | Lịch sử cảnh báo |

## API Endpoints

Tất cả API chạy trên HTTPS: `https://localhost:3443/api`

### Authentication
```
POST /api/auth/register    - Đăng ký tài khoản
POST /api/auth/login       - Đăng nhập
GET  /api/auth/me          - Lấy thông tin user
```

### Children (Thiết bị)
```
GET    /api/children                      - Danh sách
POST   /api/children                      - Tạo mới
GET    /api/children/:id                  - Chi tiết
PUT    /api/children/:id                  - Cập nhật
DELETE /api/children/:id                  - Xóa
POST   /api/children/:id/tracker-token    - Tạo token
GET    /api/children/:id/location/latest  - Vị trí mới nhất
```

### Zones (Vùng an toàn)
```
GET    /api/children/:childId/zones   - Danh sách zones
POST   /api/children/:childId/zones   - Tạo zone mới
PUT    /api/zones/:id                 - Cập nhật zone
DELETE /api/zones/:id                 - Xóa zone
```

### Tracker (GPS)
```
POST /api/tracker/ping    - Gửi vị trí GPS
```

### Alerts (Cảnh báo)
```
GET  /api/children/:id/alerts           - Danh sách alerts
POST /api/alerts/:id/read               - Đánh dấu đã đọc
POST /api/children/:id/alerts/read-all  - Đánh dấu tất cả
```

### Realtime (SSE)
```
GET /api/realtime/children/:id/events   - Stream events
```

## Ports & URLs

| Service | URL | Ghi chú |
|---------|-----|---------|
| **Backend HTTPS** | https://localhost:3443 | Chính |
| Backend HTTP | http://localhost:3000 | Phụ |
| **Frontend** | https://localhost:3443 | Served by backend |
| **Tracker** | https://localhost:3443/tracker.html | Cho iPhone |
| PostgreSQL | localhost:5433 | Docker |
| ngrok (test iPhone) | https://[random].ngrok.io | Tạm thời |

## Quick Start (TL;DR)

```powershell
# 1. Reset & khởi tạo
.\reset-backend.ps1

# 2. Setup backend
cd backend
npm install
npm run generate-cert
npm start

# 3. Setup frontend
cd frontend
npm install
npm run build  # Chờ build xong
Copy-Item .\build ..\backend\ -Recurse -Force  # Copy sau khi build hoàn tất

# 4. Truy cập
# Laptop: https://localhost:3443
# iPhone: ngrok http 3443 → copy URL
```

## Demo Scenario (7 phút)

**Bước 1: Thiết lập (2 phút)**
1. **Laptop**: Mở https://localhost:3443 → Đăng ký
2. **Laptop**: Tạo child "iPhone"
3. **Laptop**: Tab "Thiết lập" → Tạo link tracker → Copy link

**Bước 2: Kết nối thiết bị (1 phút)**
4. **iPhone**: Mở link trên Safari → Allow Location → Bắt đầu
5. **Laptop**: Thấy vị trí xuất hiện trên bản đồ tổng quan

**Bước 3: Thiết lập zones (2 phút)**
6. **Laptop**: Tab "Vùng an toàn" → Tạo zone "Nhà" (20m) tại vị trí hiện tại
7. **Laptop**: Tạo thêm zone "Công viên" (15m) tại vị trí khác
8. **Laptop**: Thấy "Trong vùng an toàn" (xanh) vì đang ở zone "Nhà"

**Bước 4: Test alerts (2 phút)**
9. **iPhone**: Đi ra ngoài cả 2 zones (>20m)
10. **Laptop**: Nhận alert "Đã rời khỏi Nhà" (đỏ)
11. **iPhone**: Di chuyển vào zone "Công viên"
12. **Laptop**: Nhận alert "Đã vào Công viên" (xanh)
13. **Laptop**: Tab "Bản đồ" xem tất cả thiết bị và zones

## Công nghệ sử dụng

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, Leaflet Maps
- **Database**: PostgreSQL 15
- **Security**: HTTPS, JWT, bcrypt
- **Realtime**: Server-Sent Events (SSE)
- **GPS**: Geolocation API (Safari)

## License

MIT License - Free for personal and commercial use

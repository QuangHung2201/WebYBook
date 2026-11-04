# WebYBook

Ứng dụng nhà sách trực tuyến:

- **Frontend:** React + Vite
- **Backend:** Java 17 + Spring Boot + MySQL/MariaDB

## Yêu cầu

Danh sách đầy đủ môi trường và thư viện xem tại
[REQUIREMENTS.md](REQUIREMENTS.md).

- Node.js 18+ và npm
- JDK 17+
- MySQL 8+ hoặc MariaDB

## 1. Cấu hình Backend

Tạo database rỗng:

```sql
CREATE DATABASE webybook
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Không import file `Backend/database/dump-bookstore_db-202611032137.sql` vào
database này. Đây là dump schema `bookstore_db`, không phải schema xác thực
hiện tại của Backend.

Sao chép file cấu hình mẫu:

```powershell
cd Backend
Copy-Item .env.example .env
```

Mở `Backend/.env` và sửa tối thiểu:

```env
DB_URL=jdbc:mysql://localhost:3306/webybook
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your-secret-with-at-least-32-bytes
```

## 2. Chạy Backend

Tại thư mục `Backend`:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend chạy tại `http://localhost:8080`.

## 3. Cấu hình và chạy Frontend

Mở terminal mới:

```powershell
cd FrontEnd
Copy-Item .env.example .env
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173`.

Mặc định Frontend dùng dữ liệu mock cho nghiệp vụ nhà sách và API Backend cho
xác thực. Cấu hình trong `FrontEnd/.env`:

```env
VITE_DATA_SOURCE=mock
VITE_AUTH_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Đặt `VITE_DATA_SOURCE=api` nếu muốn Frontend gọi API nghiệp vụ tương ứng.

## Kiểm thử và build

Backend:

```powershell
cd Backend
.\mvnw.cmd test
```

Frontend:

```powershell
cd FrontEnd
npm run lint
npm run build
```

Không commit các file `.env`.

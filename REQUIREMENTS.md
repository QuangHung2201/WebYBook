# WebYBook Requirements

Tài liệu này liệt kê các yêu cầu môi trường và thư viện cần thiết để chạy
Frontend và Backend của WebYBook.

## 1. Yêu cầu chung

- Git
- Kết nối Internet khi cài dependencies lần đầu
- MySQL 8+ hoặc MariaDB tương thích
- Database: `webybook`
- Backend API mặc định: `http://localhost:8080`
- Frontend mặc định: `http://localhost:5173`

## 2. Frontend

### Môi trường

- Node.js 18+
- npm 9+

Phiên bản đã sử dụng trong môi trường phát triển:

- Node.js 22.14.0
- npm 10.9.2

### Framework và thư viện

- React `^18.3.1`
- React DOM `^18.3.1`
- Vite `^5.4.8`
- React Router DOM `^6.26.2`
- Axios `^1.7.7`
- Zustand `^4.5.5`
- React Hook Form `^7.53.0`
- `@hookform/resolvers` `^3.9.0`
- Zod `^3.23.8`
- Recharts `^2.12.7`
- Lucide React `^0.451.0`
- Three `^0.187.0`
- `@react-three/fiber` `^8.18.0`
- `@react-three/drei` `^9.122.0`
- `@vitejs/plugin-react` `^4.3.2`

### Cài đặt và chạy

```bash
cd FrontEnd
npm ci
npm run dev
```

Build production:

```bash
npm run build
```

## 3. Backend

### Môi trường

- JDK 17+
- Maven Wrapper đi kèm dự án (`mvnw` hoặc `mvnw.cmd`)
- MySQL 8+ hoặc MariaDB tương thích

Phiên bản đã sử dụng:

- Java 17
- Spring Boot `3.5.16`
- Maven Wrapper

### Framework và thư viện

- Spring Boot Web
- Spring Data JPA
- Spring Security
- Spring Validation
- Spring Boot Mail
- MySQL Connector/J
- JJWT `0.12.6`
- H2 Database: dùng cho test
- Spring Boot Starter Test: dùng cho test
- Spring Security Test: dùng cho test

Dependencies được quản lý trong
[Backend/pom.xml](Backend/pom.xml), không cài bằng `pip` hoặc
`requirements.txt`.

### Cấu hình môi trường

Tạo file `Backend/.env` từ file mẫu:

```bash
cd Backend
cp .env.example .env
```

Các biến tối thiểu:

```env
DB_URL=jdbc:mysql://localhost:3306/webybook
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your-secret-with-at-least-32-bytes
```

Không commit file `.env`.

### Cài dependencies và chạy

Linux/macOS:

```bash
cd Backend
./mvnw spring-boot:run
```

Windows:

```powershell
cd Backend
.\mvnw.cmd spring-boot:run
```

Chạy test:

```bash
./mvnw test
```

## 4. Database

Tạo database:

```sql
CREATE DATABASE webybook
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Schema hiện tại nằm tại
[Backend/database/dump-bookstore_db-202611032137.sql](Backend/database/dump-bookstore_db-202611032137.sql).

## 5. Công cụ tùy chọn

- Postman để kiểm thử API
- MySQL Workbench hoặc DBeaver để quản lý MySQL
- Trình duyệt hiện đại để chạy Frontend

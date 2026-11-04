# WebYBook - Backend User Authentication

Backend độc lập cho website thương mại điện tử sách **WebYBook**, cung cấp các API đăng ký, đăng nhập, quên mật khẩu và lấy thông tin tài khoản hiện tại.

Dự án chỉ xây dựng Backend, không bao gồm mã nguồn Frontend.

---

## 1. Chức năng

| Nhóm chức năng | Mô tả |
|---|---|
| Đăng ký | Tạo tài khoản CUSTOMER, kiểm tra dữ liệu, email/số điện thoại trùng, mã hóa BCrypt |
| Đăng nhập | Xác thực email + mật khẩu, trả JWT Access Token và thông tin người dùng |
| Quên mật khẩu | Tạo token có thời hạn, gửi link qua email, token chỉ dùng một lần |
| Đặt lại mật khẩu | Kiểm tra token, mã hóa mật khẩu mới bằng BCrypt |
| Thông tin tài khoản | `GET /api/v1/auth/me` yêu cầu JWT hợp lệ |

---

## 2. Công nghệ

- Java 17+
- Spring Boot 3.5.16
- Maven
- MySQL 8.0+ (tương thích MariaDB 10.4+)
- Spring Data JPA / Hibernate
- Spring Security
- JWT (JJWT 0.12.6, HS256)
- BCrypt
- Jakarta Bean Validation
- JUnit 5, Mockito, MockMvc, H2 (chỉ dùng cho test profile)

---

## 3. Cấu trúc thư mục

```text
Backend_User/
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .mvn/wrapper/maven-wrapper.properties
├── .env.example
├── .gitignore
├── README.md
├── TEST_RESULTS.md
├── database/
│   └── schema.sql
├── postman/
│   └── WebYBook-User-API.postman_collection.json
└── src/
    ├── main/
    │   ├── java/com/webybook/
    │   │   ├── WebYBookApplication.java
    │   │   ├── config/
    │   │   │   ├── CorsConfig.java
    │   │   │   ├── PasswordEncoderConfig.java
    │   │   │   └── SecurityConfig.java
    │   │   ├── controller/
    │   │   │   └── AuthController.java
    │   │   ├── dto/
    │   │   │   ├── request/
    │   │   │   │   ├── ForgotPasswordRequest.java
    │   │   │   │   ├── LoginRequest.java
    │   │   │   │   ├── RegisterRequest.java
    │   │   │   │   └── ResetPasswordRequest.java
    │   │   │   └── response/
    │   │   │       ├── ApiResponse.java
    │   │   │       ├── AuthResponse.java
    │   │   │       └── UserResponse.java
    │   │   ├── entity/
    │   │   │   ├── PasswordResetToken.java
    │   │   │   └── User.java
    │   │   ├── enums/
    │   │   │   ├── UserRole.java
    │   │   │   └── UserStatus.java
    │   │   ├── exception/
    │   │   │   ├── AccountInactiveException.java
    │   │   │   ├── ApiException.java
    │   │   │   ├── BadRequestException.java
    │   │   │   ├── DuplicateResourceException.java
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   ├── InvalidCredentialsException.java
    │   │   │   ├── InvalidTokenException.java
    │   │   │   └── ResourceNotFoundException.java
    │   │   ├── repository/
    │   │   │   ├── PasswordResetTokenRepository.java
    │   │   │   └── UserRepository.java
    │   │   ├── security/
    │   │   │   ├── CustomUserDetails.java
    │   │   │   ├── CustomUserDetailsService.java
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   ├── JwtService.java
    │   │   │   ├── RestAccessDeniedHandler.java
    │   │   │   └── RestAuthenticationEntryPoint.java
    │   │   ├── service/
    │   │   │   ├── AuthService.java
    │   │   │   ├── EmailService.java
    │   │   │   ├── PasswordResetService.java
    │   │   │   └── UserService.java
    │   │   ├── util/
    │   │   │   └── ContactNormalizer.java
    │   │   └── validation/
    │   │       ├── PasswordConfirmable.java
    │   │       ├── PasswordMatches.java
    │   │       └── PasswordMatchesValidator.java
    │   └── resources/
    │       └── application.yml
    └── test/
        ├── java/com/webybook/
        │   ├── AuthApiIntegrationTest.java
        │   ├── security/JwtServiceTest.java
        │   └── service/
        │       ├── AuthServiceTest.java
        │       └── PasswordResetServiceTest.java
        └── resources/
            └── application-test.yml
```

---

## 4. Yêu cầu môi trường

- JDK 17 trở lên
- Maven 3.9+ hoặc dùng Maven Wrapper đi kèm
- MySQL 8.0+ (hoặc MariaDB 10.4+)
- Một tài khoản MySQL có quyền tạo database/bảng

Kiểm tra:

```bash
java -version
mysql --version
```

---

## 5. Cấu hình Database

### 5.1. Tạo database và bảng

Chạy file SQL:

```bash
mysql -u root -p < database/schema.sql
```

Trên Windows PowerShell:

```powershell
Get-Content -Raw .\database\schema.sql | mysql -u root -p
```

File `database/schema.sql` tạo:

- Database `webybook` với `utf8mb4`
- Bảng `users`
- Bảng `password_reset_tokens`
- Ràng buộc UNIQUE cho `email`, `phone`, `token_hash`
- Khóa ngoại `password_reset_tokens.user_id -> users.id`

### 5.2. Cho phép Hibernate tự tạo bảng (không bắt buộc)

Trong môi trường phát triển có thể đặt:

```env
JPA_DDL_AUTO=update
```

Khi triển khai thật nên chạy `schema.sql` trước và đặt:

```env
JPA_DDL_AUTO=validate
```

---

## 6. Cấu hình biến môi trường

Sao chép file mẫu:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Ứng dụng tự động đọc file `.env` ở thư mục gốc nếu có (`spring.config.import`). Biến môi trường thật của hệ điều hành vẫn có độ ưu tiên cao hơn. **Không commit file `.env`.**

Khi chạy từ IDE, hãy đặt biến môi trường trong Run Configuration hoặc đặt file `.env` ở đúng working directory của project.

Các biến quan trọng:

| Biến | Bắt buộc | Mặc định | Mô tả |
|---|---:|---|---|
| `DB_URL` | Không | `jdbc:mysql://localhost:3306/webybook...` | JDBC URL |
| `DB_USERNAME` | Không | `root` | Tài khoản MySQL |
| `DB_PASSWORD` | Không | rỗng | Mật khẩu MySQL |
| `JWT_SECRET` | **Có** | không có | Khóa bí mật JWT, tối thiểu 32 bytes |
| `JWT_EXPIRATION_MS` | Không | `86400000` | Thời hạn access token (24 giờ) |
| `JWT_ISSUER` | Không | `webybook` | Issuer trong JWT |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | Không | `15` | Thời hạn token đặt lại mật khẩu |
| `PASSWORD_RESET_URL` | Không | `http://localhost:5173/reset-password` | Trang Frontend nhận token |
| `MAIL_ENABLED` | Không | `false` | `false`: ghi link vào log; `true`: gửi SMTP thật |
| `MAIL_FROM` | Không | `no-reply@webybook.vn` | Địa chỉ gửi |
| `SMTP_HOST` | Khi bật mail | `localhost` | SMTP host |
| `SMTP_PORT` | Khi bật mail | `587` | SMTP port |
| `SMTP_USERNAME` | Khi bật mail | rỗng | SMTP username |
| `SMTP_PASSWORD` | Khi bật mail | rỗng | SMTP password/app password |
| `SMTP_AUTH` | Không | `true` | Bật SMTP auth |
| `SMTP_STARTTLS` | Không | `true` | Bật STARTTLS |
| `CORS_ALLOWED_ORIGINS` | Không | `http://localhost:3000,http://localhost:5173` | Danh sách origin, phân tách bằng dấu phẩy |
| `SERVER_PORT` | Không | `8080` | Cổng chạy ứng dụng |
| `JPA_DDL_AUTO` | Không | `update` | `update`, `validate`, `none`... |
| `JPA_SHOW_SQL` | Không | `false` | Hiện SQL |

### Tạo JWT Secret an toàn

```bash
openssl rand -base64 48
```

Sau đó gán vào `.env`:

```env
JWT_SECRET=<chuỗi-vừa-tạo>
```

`JWT_SECRET` phải có ít nhất 32 bytes. Ứng dụng sẽ dừng khởi động nếu khóa quá ngắn.

### Chế độ email khi phát triển

Đặt:

```env
MAIL_ENABLED=false
```

Khi gọi API quên mật khẩu, ứng dụng không gửi email thật mà ghi link vào log:

```text
[MAIL DEV] Link đặt lại mật khẩu cho user@example.com (Nguyen Van A): http://localhost:5173/reset-password?token=...
```

Khi gửi email thật, đặt `MAIL_ENABLED=true` và cấu hình đầy đủ `SMTP_*`.

---

## 7. Chạy Backend

### Cách 1: Maven Wrapper

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

### Cách 2: Build JAR và chạy

```bash
./mvnw clean package
java -jar target/webybook-user-1.0.0.jar
```

Windows:

```powershell
.\mvnw.cmd clean package
java -jar target\webybook-user-1.0.0.jar
```

Ứng dụng chạy mặc định tại:

```text
http://localhost:8080
```

Kiểm tra nhanh:

```bash
curl http://localhost:8080/api/v1/auth/me
```

Kết quả mong đợi: HTTP `401` với JSON lỗi xác thực.

---

## 8. Danh sách API

Base URL:

```text
http://localhost:8080/api/v1
```

| Method | Endpoint | Xác thực | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | Công khai | Đăng ký tài khoản |
| POST | `/auth/login` | Công khai | Đăng nhập, nhận JWT |
| POST | `/auth/forgot-password` | Công khai | Yêu cầu gửi link đặt lại mật khẩu |
| POST | `/auth/reset-password` | Công khai + token riêng | Đặt lại mật khẩu bằng token |
| GET | `/auth/me` | Bearer JWT | Lấy thông tin tài khoản hiện tại |

### 8.1. Đăng ký

`POST /api/v1/auth/register`

Request:

```json
{
  "fullName": "Nguyen Van A",
  "email": "user@gmail.com",
  "phone": "0912345678",
  "password": "secret123",
  "confirmPassword": "secret123"
}
```

Quy tắc:

- `fullName`: bắt buộc, 2–80 ký tự
- `email`: bắt buộc, đúng định dạng, không trùng
- `phone`: bắt buộc, đúng định dạng Việt Nam, không trùng
- `password`: bắt buộc, 6–72 ký tự
- `confirmPassword`: phải trùng `password`
- `role` và `status` do server gán, Client không thể tự đổi

Response thành công — HTTP `201`:

```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "id": 1,
    "fullName": "Nguyen Van A",
    "email": "user@gmail.com",
    "phone": "0912345678",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

Lỗi validation — HTTP `400`:

```json
{
  "success": false,
  "message": "Dữ liệu đầu vào không hợp lệ",
  "data": {
    "email": "Email không đúng định dạng",
    "password": "Mật khẩu phải có từ 6 đến 72 ký tự"
  }
}
```

Email đã tồn tại — HTTP `409`:

```json
{
  "success": false,
  "message": "Email đã được sử dụng",
  "data": null
}
```

Số điện thoại đã tồn tại — HTTP `409`:

```json
{
  "success": false,
  "message": "Số điện thoại đã được sử dụng",
  "data": null
}
```

### 8.2. Đăng nhập

`POST /api/v1/auth/login`

Request:

```json
{
  "email": "user@gmail.com",
  "password": "secret123"
}
```

Response thành công — HTTP `200`:

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "JWT_ACCESS_TOKEN",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "email": "user@gmail.com",
      "phone": "0912345678",
      "role": "CUSTOMER",
      "status": "ACTIVE"
    }
  }
}
```

Sai email hoặc sai mật khẩu — HTTP `401` (cùng một thông báo):

```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không chính xác",
  "data": null
}
```

Tài khoản bị khóa/không hoạt động (khi mật khẩu đúng) — HTTP `403`:

```json
{
  "success": false,
  "message": "Tài khoản đã bị khóa hoặc không hoạt động",
  "data": null
}
```

### 8.3. Quên mật khẩu

`POST /api/v1/auth/forgot-password`

Request:

```json
{
  "email": "user@gmail.com"
}
```

Response — HTTP `200` (luôn cùng thông báo, không tiết lộ email có tồn tại hay không):

```json
{
  "success": true,
  "message": "Nếu email đã được đăng ký, hướng dẫn đặt lại mật khẩu đã được gửi",
  "data": null
}
```

Nếu `MAIL_ENABLED=false`, mở log ứng dụng để lấy link chứa token. Nếu `MAIL_ENABLED=true`, người dùng nhận email chứa link dạng:

```text
http://localhost:5173/reset-password?token=RAW_TOKEN
```

### 8.4. Đặt lại mật khẩu

`POST /api/v1/auth/reset-password`

Request:

```json
{
  "token": "RAW_TOKEN_FROM_EMAIL",
  "newPassword": "newSecret123",
  "confirmPassword": "newSecret123"
}
```

Response thành công — HTTP `200`:

```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công",
  "data": null
}
```

Token không hợp lệ/hết hạn/đã dùng — HTTP `400`:

```json
{
  "success": false,
  "message": "Token đặt lại mật khẩu đã hết hạn",
  "data": null
}
```

### 8.5. Thông tin tài khoản hiện tại

`GET /api/v1/auth/me`

Header:

```text
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

Response — HTTP `200`:

```json
{
  "success": true,
  "message": "Lấy thông tin tài khoản thành công",
  "data": {
    "id": 1,
    "fullName": "Nguyen Van A",
    "email": "user@gmail.com",
    "phone": "0912345678",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

Không có token / token sai / token hết hạn — HTTP `401`:

```json
{
  "success": false,
  "message": "Chưa xác thực hoặc token không hợp lệ",
  "data": null
}
```

---

## 9. HTTP Status Code

| Status | Ý nghĩa |
|---:|---|
| 200 | Thành công |
| 201 | Tạo tài khoản thành công |
| 400 | Dữ liệu đầu vào không hợp lệ, token reset không hợp lệ/hết hạn/đã dùng |
| 401 | Chưa xác thực, JWT không hợp lệ/hết hạn, sai email/mật khẩu |
| 403 | Tài khoản bị khóa/không hoạt động, không có quyền |
| 404 | Không tìm thấy tài nguyên |
| 409 | Email/số điện thoại bị trùng |
| 500 | Lỗi hệ thống |

Mọi phản hồi đều có cấu trúc:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

---

## 10. Postman

Import file:

```text
postman/WebYBook-User-API.postman_collection.json
```

Collection sử dụng các biến:

- `baseUrl` — mặc định `http://localhost:8080`
- `token` — tự động lưu sau khi gọi API Login thành công
- `resetToken` — token lấy từ email/log, dùng cho request Reset Password

Thứ tự thử nghiệm:

1. Gọi **Đăng ký**
2. Gọi **Đăng nhập** — collection tự lưu `token`
3. Gọi **Thông tin tài khoản** — header dùng `Bearer {{token}}`
4. Gọi **Quên mật khẩu** — lấy link trong email hoặc log
5. Gán token vào biến `resetToken`
6. Gọi **Đặt lại mật khẩu**

Có thể dùng `curl`:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nguyen Van A","email":"user@gmail.com","phone":"0912345678","password":"secret123","confirmPassword":"secret123"}'
```

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gmail.com","password":"secret123"}'
```

```bash
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer JWT_ACCESS_TOKEN"
```

---

## 11. Kiểm thử

Chạy toàn bộ test:

```bash
./mvnw test
```

Windows:

```powershell
.\mvnw.cmd test
```

Kết quả hiện tại: **53 tests, 0 failures, 0 errors**.

Chi tiết xem tại [`TEST_RESULTS.md`](TEST_RESULTS.md).

- Test service dùng JUnit 5 + Mockito.
- Test API dùng MockMvc + `@SpringBootTest`.
- Profile test dùng H2 in-memory để test độc lập, không ảnh hưởng database MySQL thật.
- Ứng dụng chạy thật đã được kiểm tra với MySQL-compatible database và file `database/schema.sql`.

---

## 12. Ghi chú bảo mật

- Mật khẩu được mã hóa BCrypt trước khi lưu, không bao giờ trả về trong response.
- `confirmPassword` chỉ dùng để kiểm tra, không lưu Database.
- JWT dùng HS256, có `issuer`, `issuedAt`, `expiration`; secret lấy từ `JWT_SECRET`.
- Server luôn gán `role = CUSTOMER`, `status = ACTIVE` khi đăng ký; Client gửi `role`/`status` sẽ bị bỏ qua.
- Login không phân biệt lỗi "email không tồn tại" và "sai mật khẩu".
- Token reset mật khẩu:
  - Sinh bằng `SecureRandom` 32 bytes
  - Chỉ lưu SHA-256 hash trong Database
  - Có thời hạn cấu hình được
  - Chỉ sử dụng một lần
  - Yêu cầu mới sẽ vô hiệu hóa các token cũ chưa dùng
- Các API được bảo vệ bởi Spring Security và `JwtAuthenticationFilter`.
- Lỗi được xử lý tập trung bởi `GlobalExceptionHandler`.
- Thông tin nhạy cảm (DB, JWT, SMTP) lấy từ biến môi trường, không hard-code trong mã nguồn.

---

## 13. API quản trị

Các endpoint dưới đây yêu cầu JWT của tài khoản có role `ADMIN`. Tài khoản
`CUSTOMER` sẽ nhận `403`.

| Nhóm | Endpoint chính |
|---|---|
| Dashboard | `GET /api/v1/admin/dashboard`, `/orders-by-status`, `/top-selling-books`, `/low-stock`, `/revenue/daily`, `/revenue/weekly` |
| Sách | `GET/POST /api/v1/admin/books`, `GET/PUT/DELETE /api/v1/admin/books/{id}` |
| Danh mục | `GET/POST/PUT/DELETE /api/v1/admin/categories[/{id}]` |
| Tác giả | `GET/POST/PUT/DELETE /api/v1/admin/authors[/{id}]` |
| Nhà xuất bản | `GET/POST/PUT/DELETE /api/v1/admin/publishers[/{id}]` |
| Người dùng | `GET /api/v1/admin/users`, `GET /{id}`, `PUT /{id}` |
| Đơn hàng | `GET /api/v1/admin/orders`, `GET /{id}`, `PUT /{id}/status`, `GET /{id}/history` |
| Voucher | `GET/POST /api/v1/admin/vouchers`, `PUT/DELETE /{id}` |
| Đánh giá | `GET /api/v1/admin/reviews`, `GET /{id}`, `PUT /{id}/status`, `DELETE /{id}` |
| Phương thức giao hàng | `GET/POST /api/v1/admin/shipping-methods`, `GET/PUT/DELETE /{id}` |

API sách hỗ trợ `search`, `categoryId`, `page`, `limit`. Xóa sách là
soft-delete bằng cách chuyển `status` sang `deleted`. Chuyển trạng thái đơn
hàng được giới hạn theo luồng hợp lệ và ghi vào `order_status_history`.
Dashboard và báo cáo truy vấn trực tiếp dữ liệu MySQL, không dùng mock. Doanh thu
không tính đơn hàng `cancelled`/`canceled`. Hai API doanh thu hỗ trợ tùy chọn
`from` và `to` theo định dạng `YYYY-MM-DD`; API theo tuần trả về ngày thứ Hai
(`week_start`) của từng tuần.

Admin có thể kiểm duyệt đánh giá bằng trạng thái `approved` hoặc `rejected`.
Xóa phương thức giao hàng được triển khai dưới dạng vô hiệu hóa (`inactive`) để
không phá vỡ các đơn hàng đã tham chiếu phương thức đó.

Role được khởi tạo tự động khi Backend khởi động: `CUSTOMER` và `ADMIN`.
Không có endpoint public nào cho phép người dùng tự đổi role.

JWT access token mặc định có thời hạn 24 giờ. Có thể giảm bằng
`JWT_EXPIRATION_MS`. CORS mặc định cho phép các origin phát triển local;
cấu hình lại bằng `CORS_ALLOWED_ORIGINS` khi triển khai.

# Kết quả kiểm thử - WebYBook User Backend

- Ngày chạy: 2026-11-03
- Môi trường: Windows 11, JDK 25.0.1 (compile target Java 17), Maven 3.9.11
- Lệnh: `mvn test`
- Kết quả: **53 tests, 0 failures, 0 errors, 0 skipped**
- Kết quả build: **BUILD SUCCESS**

## 1. Tổng hợp theo test class

| Test class | Số test | Kết quả |
|---|---:|---|
| `AuthApiIntegrationTest` | 23 | PASS |
| `AuthServiceTest` | 13 | PASS |
| `PasswordResetServiceTest` | 11 | PASS |
| `JwtServiceTest` | 6 | PASS |
| **Tổng** | **53** | **PASS** |

## 2. Đối chiếu yêu cầu kiểm thử

### Đăng ký

| Trường hợp | Test |
|---|---|
| Đăng ký thành công | `AuthApiIntegrationTest.register_success_returnsCreatedUserWithoutPassword`, `AuthServiceTest.register_success_encodesPasswordAndAssignsCustomerRole` |
| Email đã tồn tại | `AuthApiIntegrationTest.register_duplicateEmail_returnsConflict`, `AuthServiceTest.register_duplicateEmail_throwsConflict` |
| Số điện thoại đã tồn tại | `AuthApiIntegrationTest.register_duplicatePhone_returnsConflict`, `AuthServiceTest.register_duplicatePhone_throwsConflict` |
| Email sai định dạng | `AuthApiIntegrationTest.register_invalidEmail_returnsValidationError` |
| Số điện thoại sai định dạng | `AuthApiIntegrationTest.register_invalidPhone_returnsValidationError` |
| Mật khẩu quá ngắn | `AuthApiIntegrationTest.register_shortPassword_returnsValidationError`, `AuthServiceTest.register_shortPassword_throwsBadRequest` |
| Xác nhận mật khẩu không trùng | `AuthApiIntegrationTest.register_passwordConfirmationMismatch_returnsValidationError`, `AuthServiceTest.register_passwordMismatch_throwsBadRequest` |
| Thiếu dữ liệu | `AuthApiIntegrationTest.register_missingRequiredFields_returnsValidationErrors` |
| Client tự gửi role/status | `AuthApiIntegrationTest.register_ignoresClientSuppliedRoleAndStatus` |
| Race condition unique constraint | `AuthServiceTest.register_databaseConstraintRace_throwsConflict` |

### Đăng nhập

| Trường hợp | Test |
|---|---|
| Đăng nhập thành công | `AuthApiIntegrationTest.login_success_andCurrentUserWithValidToken`, `AuthServiceTest.login_success_returnsTokenAndUser` |
| Email không tồn tại | `AuthApiIntegrationTest.login_unknownEmailAndWrongPassword_returnTheSameMessage`, `AuthServiceTest.login_unknownEmail_returnsGenericInvalidCredentials` |
| Mật khẩu sai | `AuthApiIntegrationTest.login_unknownEmailAndWrongPassword_returnTheSameMessage`, `AuthServiceTest.login_wrongPassword_returnsGenericInvalidCredentials` |
| Tài khoản bị khóa | `AuthApiIntegrationTest.login_lockedAccount_returnsForbidden`, `AuthServiceTest.login_lockedAccountWithCorrectPassword_returnsForbidden` |
| Sai mật khẩu trên tài khoản khóa không lộ trạng thái | `AuthServiceTest.login_lockedAccountWithWrongPassword_doesNotRevealAccountState` |
| Thiếu email/mật khẩu | `AuthApiIntegrationTest.login_missingCredentials_returnsValidationError`, `AuthServiceTest.login_missingCredentials_throwsBadRequest` |
| Email sai định dạng | `AuthApiIntegrationTest.login_invalidEmail_returnsValidationError` |
| Token hợp lệ khi gọi `/me` | `AuthApiIntegrationTest.login_success_andCurrentUserWithValidToken` |
| Token không hợp lệ | `AuthApiIntegrationTest.me_withInvalidToken_returnsUnauthorized` |
| Không có token | `AuthApiIntegrationTest.me_withoutToken_returnsUnauthorized` |
| Token của tài khoản bị khóa | `AuthApiIntegrationTest.me_withTokenOfLockedAccount_returnsForbidden` |

### Quên mật khẩu / đặt lại mật khẩu

| Trường hợp | Test |
|---|---|
| Yêu cầu đặt lại mật khẩu thành công | `AuthApiIntegrationTest.forgotPassword_existingEmail_createsOneTimeTokenAndResetsPassword`, `PasswordResetServiceTest.requestReset_existingEmail_storesOnlyHashAndSendsLink` |
| Email không tồn tại | `AuthApiIntegrationTest.forgotPassword_unknownEmail_returnsGenericMessageWithoutSendingMail`, `PasswordResetServiceTest.requestReset_unknownEmail_doesNotRevealOrCreateToken` |
| Email sai định dạng | `AuthApiIntegrationTest.forgotPassword_invalidEmail_returnsValidationError` |
| Token không hợp lệ | `AuthApiIntegrationTest.resetPassword_invalidToken_returnsBadRequest`, `PasswordResetServiceTest.resetPassword_unknownToken_throwsInvalidToken` |
| Token hết hạn | `AuthApiIntegrationTest.resetPassword_expiredToken_returnsBadRequest`, `PasswordResetServiceTest.resetPassword_expiredToken_throwsInvalidToken` |
| Token đã được sử dụng | `AuthApiIntegrationTest.forgotPassword_existingEmail_createsOneTimeTokenAndResetsPassword` (dùng lại token), `PasswordResetServiceTest.resetPassword_tokenCannotBeReused` |
| Đặt lại mật khẩu thành công | `AuthApiIntegrationTest.forgotPassword_existingEmail_createsOneTimeTokenAndResetsPassword`, `PasswordResetServiceTest.resetPassword_success_hashesPasswordAndMarksTokenUsed` |
| Xác nhận mật khẩu mới không trùng | `AuthApiIntegrationTest.resetPassword_confirmationMismatch_returnsValidationError`, `PasswordResetServiceTest.resetPassword_mismatchedConfirmation_throwsBadRequest` |
| Tài khoản không hoạt động | `PasswordResetServiceTest.resetPassword_inactiveUser_throwsForbidden` |
| Lỗi SMTP không làm lộ thông tin | `PasswordResetServiceTest.requestReset_mailFailure_stillReturnsNormally` |

### JWT

| Trường hợp | Test |
|---|---|
| Tạo token và đọc claims | `JwtServiceTest.generateToken_containsExpectedClaims` |
| Token hợp lệ | `JwtServiceTest.validToken_isAcceptedForMatchingUser` |
| Token của user khác | `JwtServiceTest.validToken_isRejectedForDifferentUser` |
| Token sai định dạng | `JwtServiceTest.invalidToken_isRejected` |
| Token hết hạn | `JwtServiceTest.expiredToken_isRejected` |
| JWT secret quá ngắn | `JwtServiceTest.shortSecret_isRejectedAtStartup` |

## 3. Kiểm thử thủ công với database thật

Ngoài bộ test tự động (H2 test profile), ứng dụng đã được build JAR và chạy thực tế với MySQL-compatible database (MariaDB 10.4 tại môi trường phát triển), sử dụng file `database/schema.sql`.

Các bước đã kiểm tra:

| Bước | Kết quả |
|---|---|
| Chạy `database/schema.sql` | Tạo thành công `users`, `password_reset_tokens`, UNIQUE và FOREIGN KEY |
| Khởi động ứng dụng với `JPA_DDL_AUTO=validate` | Thành công, Hibernate validate schema khớp |
| Đăng ký tài khoản | HTTP `201`, mật khẩu lưu dạng `$2a$10$...` |
| Đăng nhập | HTTP `200`, trả JWT HS256 |
| Gọi `/api/v1/auth/me` với JWT | HTTP `200` |
| Gọi `/api/v1/auth/me` với token sai | HTTP `401` |
| Quên mật khẩu | HTTP `200`, log sinh link chứa token (chế độ `MAIL_ENABLED=false`) |
| Đặt lại mật khẩu | HTTP `200`, mật khẩu cũ không đăng nhập được, mật khẩu mới đăng nhập được |
| Dùng lại token reset | HTTP `400`, token đã được sử dụng |
| CORS preflight từ `http://localhost:3000` | HTTP `200`, trả đúng `Access-Control-Allow-Origin` |
| Tự tạo bảng bằng `JPA_DDL_AUTO=update` trên database trống | Thành công |

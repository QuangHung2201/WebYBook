import { authRepository } from '../repositories/authRepository';
//AuthService chuẩn hóa dữ liệu
//Service loại bỏ khoảng trắng ở đầu/cuối email rồi gọi authRepository
export const authService = {
  login(credentials) {
    return authRepository.login({
      email: credentials.email?.trim(),
      password: credentials.password,
    });
  },

  // chuẩn hóa dữ liệu trước khi gọi authRepository
  // loại bỏ khoảng trắng ở đầu/cuối email, fullName, phone
  // password và confirmPassword giữ nguyên
  // phone có thể là chuỗi rỗng nếu không có giá trị
  //gửi dữ liệu đã chuẩn hóa đến authRepository để thực hiện đăng ký
  register(data) {

    return authRepository.register({
      email: data.email?.trim(),
      password: data.password,
      confirmPassword: data.confirmPassword,
      fullName: data.fullName?.trim(),
      phone: data.phone?.trim() || '',
    });
  },

  forgotPassword(email) {
    return authRepository.forgotPassword({ email: email?.trim() });
  },

  getCurrentUser(token) {
    return authRepository.getMe(token);
  },

  logout() {
    return authRepository.logout();
  },
};

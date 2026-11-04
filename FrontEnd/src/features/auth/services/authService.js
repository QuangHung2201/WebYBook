import { authRepository } from '../repositories/authRepository';

export const authService = {
  login(credentials) {
    return authRepository.login({
      email: credentials.email?.trim(),
      password: credentials.password,
    });
  },

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

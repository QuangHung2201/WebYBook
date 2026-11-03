import { userRepository } from '../repositories/userRepository';

export const userService = {
  getProfile: (userId) => userRepository.getProfile(userId),
  updateProfile: (userId, data) => userRepository.updateProfile(userId, data),
  changePassword: (userId, data) => userRepository.changePassword(userId, data),
  getUsers: () => userRepository.getUsers(),
  updateRole: (userId, role) => userRepository.updateRole(userId, role),
  updateStatus: (userId, status) => userRepository.updateStatus(userId, status),
};

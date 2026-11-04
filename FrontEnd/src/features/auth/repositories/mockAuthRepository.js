import { readCollection, writeCollection, nextId, delay } from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { usersMock } from '@/data/mock/users.mock';
import { USER_ROLES, USER_STATUS } from '@/data/constants/userRoles';

const stripPassword = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

const findByEmail = (users, email) => {
  const keyword = String(email || '').trim().toLowerCase();
  return users.find((user) => user.email.toLowerCase() === keyword);
};

export const mockAuthRepository = {
  async login({ email, password }) {
    await delay(420);
    const users = readCollection(STORAGE_KEYS.USERS, usersMock);
    const user = findByEmail(users, email);

    if (!user || user.password !== password) {
      throw new Error('Email hoặc mật khẩu không đúng.');
    }
    if (user.status === USER_STATUS.LOCKED) {
      throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    return {
      token: `mock-token-${user.id}-${Date.now()}`,
      user: stripPassword(user),
    };
  },

  async register({ email, password, fullName, phone }) {
    await delay(500);
    const users = readCollection(STORAGE_KEYS.USERS, usersMock);

    const duplicatedEmail = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (duplicatedEmail) throw new Error('Email này đã được sử dụng.');

    const user = {
      id: nextId(users),
      username: email.split('@')[0],
      email,
      password,
      fullName,
      phone: phone || '',
      address: '',
      role: USER_ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE,
      avatar: '',
      createdAt: new Date().toISOString(),
    };

    writeCollection(STORAGE_KEYS.USERS, [...users, user]);

    return {
      token: `mock-token-${user.id}-${Date.now()}`,
      user: stripPassword(user),
    };
  },

  async forgotPassword({ email }) {
    await delay(450);
    const users = readCollection(STORAGE_KEYS.USERS, usersMock);
    const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (!exists) throw new Error('Không tìm thấy tài khoản với email này.');
    return {
      message: 'Yêu cầu đã được ghi nhận. Vui lòng kiểm tra email để đặt lại mật khẩu.',
    };
  },

  async getMe(token) {
    await delay(120);
    const match = /^mock-token-(\d+)-/.exec(token || '');
    if (!match) return null;
    const users = readCollection(STORAGE_KEYS.USERS, usersMock);
    const user = users.find((item) => String(item.id) === match[1]);
    return stripPassword(user);
  },

  async logout() {
    await delay(80);
    return true;
  },
};

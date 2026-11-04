import { delay, readCollection, writeCollection } from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { usersMock } from '@/data/mock/users.mock';

const read = () => readCollection(STORAGE_KEYS.USERS, usersMock);
const strip = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

export const mockUserRepository = {
  async getProfile(userId) {
    await delay(200);
    const user = read().find((item) => String(item.id) === String(userId));
    if (!user) throw new Error('Không tìm thấy người dùng.');
    return strip(user);
  },

  async updateProfile(userId, data) {
    await delay(360);
    const users = read();
    const index = users.findIndex((item) => String(item.id) === String(userId));
    if (index === -1) throw new Error('Không tìm thấy người dùng.');

    const duplicated = users.some(
      (item) =>
        String(item.id) !== String(userId) &&
        item.email.toLowerCase() === String(data.email).toLowerCase(),
    );
    if (duplicated) throw new Error('Email này đã được sử dụng bởi tài khoản khác.');

    users[index] = {
      ...users[index],
      fullName: data.fullName?.trim() ?? users[index].fullName,
      email: data.email?.trim() ?? users[index].email,
      phone: data.phone?.trim() ?? users[index].phone,
      address: data.address?.trim() ?? users[index].address,
    };
    writeCollection(STORAGE_KEYS.USERS, users);
    return strip(users[index]);
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    await delay(360);
    const users = read();
    const index = users.findIndex((item) => String(item.id) === String(userId));
    if (index === -1) throw new Error('Không tìm thấy người dùng.');
    if (users[index].password !== currentPassword) throw new Error('Mật khẩu hiện tại không đúng.');
    users[index] = { ...users[index], password: newPassword };
    writeCollection(STORAGE_KEYS.USERS, users);
    return true;
  },

  async getUsers() {
    await delay(220);
    return read().map(strip);
  },

  async updateRole(userId, role) {
    await delay(260);
    const users = read();
    const index = users.findIndex((item) => String(item.id) === String(userId));
    if (index === -1) throw new Error('Không tìm thấy người dùng.');
    users[index] = { ...users[index], role };
    writeCollection(STORAGE_KEYS.USERS, users);
    return strip(users[index]);
  },

  async updateStatus(userId, status) {
    await delay(260);
    const users = read();
    const index = users.findIndex((item) => String(item.id) === String(userId));
    if (index === -1) throw new Error('Không tìm thấy người dùng.');
    users[index] = { ...users[index], status };
    writeCollection(STORAGE_KEYS.USERS, users);
    return strip(users[index]);
  },
};

import { delay, nextId, readCollection, writeCollection } from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';

export const mockContactRepository = {
  async getMyContacts(email) {
    await delay(180);
    if (!email) return [];
    return readCollection(STORAGE_KEYS.CONTACTS, []).filter(
      (contact) => String(contact.email || '').toLowerCase() === String(email).toLowerCase(),
    );
  },
  async sendContact(data) {
    await delay(420);
    const contacts = readCollection(STORAGE_KEYS.CONTACTS, []);
    const contact = {
      id: nextId(contacts),
      ...data,
      createdAt: new Date().toISOString(),
    };
    writeCollection(STORAGE_KEYS.CONTACTS, [contact, ...contacts]);
    return {
      message: 'Cảm ơn bạn đã liên hệ. WebYBook sẽ phản hồi trong thời gian sớm nhất.',
    };
  },
};

import {
  deepClone,
  delay,
  nextId,
  readCollection,
  writeCollection,
} from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { publishersMock } from '@/data/mock/publishers.mock';
import { booksMock } from '@/data/mock/books.mock';

const read = () => readCollection(STORAGE_KEYS.PUBLISHERS, publishersMock);

const withBookCount = (publisher, books) => ({
  ...publisher,
  bookCount: books.filter((book) => String(book.publisher?.id) === String(publisher.id)).length,
});

export const mockPublisherRepository = {
  async getPublishers() {
    await delay(200);
    const books = readCollection(STORAGE_KEYS.BOOKS, booksMock);
    return read().map((publisher) => withBookCount(publisher, books));
  },

  async createPublisher(data) {
    await delay(300);
    const publishers = read();
    const publisher = {
      id: nextId(publishers),
      name: data.name.trim(),
      address: data.address || '',
      website: data.website || '',
    };
    writeCollection(STORAGE_KEYS.PUBLISHERS, [...publishers, publisher]);
    return deepClone(publisher);
  },

  async updatePublisher(id, data) {
    await delay(300);
    const publishers = read();
    const index = publishers.findIndex((item) => String(item.id) === String(id));
    if (index === -1) throw new Error('Không tìm thấy nhà xuất bản.');
    publishers[index] = {
      ...publishers[index],
      ...data,
      name: data.name?.trim() ?? publishers[index].name,
    };
    writeCollection(STORAGE_KEYS.PUBLISHERS, publishers);
    return deepClone(publishers[index]);
  },

  async deletePublisher(id) {
    await delay(300);
    const books = readCollection(STORAGE_KEYS.BOOKS, booksMock);
    if (books.some((book) => String(book.publisher?.id) === String(id))) {
      throw new Error('Không thể xóa nhà xuất bản đang có sách.');
    }
    const publishers = read();
    writeCollection(
      STORAGE_KEYS.PUBLISHERS,
      publishers.filter((item) => String(item.id) !== String(id)),
    );
    return true;
  },
};

import {
  deepClone,
  delay,
  nextId,
  readCollection,
  writeCollection,
} from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { authorsMock } from '@/data/mock/authors.mock';
import { booksMock } from '@/data/mock/books.mock';

const read = () => readCollection(STORAGE_KEYS.AUTHORS, authorsMock);

const withBookCount = (author, books) => ({
  ...author,
  bookCount: books.filter((book) => String(book.author?.id) === String(author.id)).length,
});

export const mockAuthorRepository = {
  async getAuthors() {
    await delay(200);
    const books = readCollection(STORAGE_KEYS.BOOKS, booksMock);
    return read().map((author) => withBookCount(author, books));
  },

  async createAuthor(data) {
    await delay(300);
    const authors = read();
    const author = {
      id: nextId(authors),
      name: data.name.trim(),
      bio: data.bio || '',
      avatar: data.avatar || '',
    };
    writeCollection(STORAGE_KEYS.AUTHORS, [...authors, author]);
    return deepClone(author);
  },

  async updateAuthor(id, data) {
    await delay(300);
    const authors = read();
    const index = authors.findIndex((item) => String(item.id) === String(id));
    if (index === -1) throw new Error('Không tìm thấy tác giả.');
    authors[index] = { ...authors[index], ...data, name: data.name?.trim() ?? authors[index].name };
    writeCollection(STORAGE_KEYS.AUTHORS, authors);
    return deepClone(authors[index]);
  },

  async deleteAuthor(id) {
    await delay(300);
    const books = readCollection(STORAGE_KEYS.BOOKS, booksMock);
    if (books.some((book) => String(book.author?.id) === String(id))) {
      throw new Error('Không thể xóa tác giả đang có sách.');
    }
    const authors = read();
    writeCollection(
      STORAGE_KEYS.AUTHORS,
      authors.filter((item) => String(item.id) !== String(id)),
    );
    return true;
  },
};

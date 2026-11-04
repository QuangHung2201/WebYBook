import {
  deepClone,
  delay,
  nextId,
  readCollection,
  writeCollection,
} from '@/infrastructure/storage/mockCollection';
import { STORAGE_KEYS } from '@/infrastructure/storage/storageKeys';
import { categoriesMock } from '@/data/mock/categories.mock';
import { booksMock } from '@/data/mock/books.mock';
import { normalizeKeyword } from '@/shared/utils/validators';

const read = () => readCollection(STORAGE_KEYS.CATEGORIES, categoriesMock);

const slugify = (value) =>
  normalizeKeyword(value).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const withBookCount = (category, books) => ({
  ...category,
  bookCount: books.filter((book) => String(book.category?.id) === String(category.id)).length,
});

export const mockCategoryRepository = {
  async getCategories() {
    await delay(200);
    const books = readCollection(STORAGE_KEYS.BOOKS, booksMock);
    return read().map((category) => withBookCount(category, books));
  },

  async createCategory(data) {
    await delay(300);
    const categories = read();
    if (categories.some((item) => item.name.toLowerCase() === data.name.trim().toLowerCase())) {
      throw new Error('Danh mục này đã tồn tại.');
    }
    const category = {
      id: nextId(categories),
      name: data.name.trim(),
      slug: slugify(data.name),
      description: data.description || '',
    };
    writeCollection(STORAGE_KEYS.CATEGORIES, [...categories, category]);
    return deepClone(category);
  },

  async updateCategory(id, data) {
    await delay(300);
    const categories = read();
    const index = categories.findIndex((item) => String(item.id) === String(id));
    if (index === -1) throw new Error('Không tìm thấy danh mục.');
    categories[index] = {
      ...categories[index],
      ...data,
      name: data.name?.trim() ?? categories[index].name,
      slug: data.name ? slugify(data.name) : categories[index].slug,
    };
    writeCollection(STORAGE_KEYS.CATEGORIES, categories);
    return deepClone(categories[index]);
  },

  async deleteCategory(id) {
    await delay(300);
    const books = readCollection(STORAGE_KEYS.BOOKS, booksMock);
    if (books.some((book) => String(book.category?.id) === String(id))) {
      throw new Error('Không thể xóa danh mục đang có sách.');
    }
    const categories = read();
    writeCollection(
      STORAGE_KEYS.CATEGORIES,
      categories.filter((item) => String(item.id) !== String(id)),
    );
    return true;
  },
};

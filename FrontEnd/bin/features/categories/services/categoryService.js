import { categoryRepository } from '../repositories/categoryRepository';

export const categoryService = {
  getCategories: () => categoryRepository.getCategories(),
  createCategory: (data) => categoryRepository.createCategory(data),
  updateCategory: (id, data) => categoryRepository.updateCategory(id, data),
  deleteCategory: (id) => categoryRepository.deleteCategory(id),
};

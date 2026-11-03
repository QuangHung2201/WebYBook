import { authorRepository } from '../repositories/authorRepository';

export const authorService = {
  getAuthors: () => authorRepository.getAuthors(),
  createAuthor: (data) => authorRepository.createAuthor(data),
  updateAuthor: (id, data) => authorRepository.updateAuthor(id, data),
  deleteAuthor: (id) => authorRepository.deleteAuthor(id),
};

import { publisherRepository } from '../repositories/publisherRepository';

export const publisherService = {
  getPublishers: () => publisherRepository.getPublishers(),
  createPublisher: (data) => publisherRepository.createPublisher(data),
  updatePublisher: (id, data) => publisherRepository.updatePublisher(id, data),
  deletePublisher: (id) => publisherRepository.deletePublisher(id),
};

import { contactRepository } from '../repositories/contactRepository';

export const contactService = {
  sendContact: (data) => contactRepository.sendContact(data),
};

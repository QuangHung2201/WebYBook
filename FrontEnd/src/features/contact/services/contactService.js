import { contactRepository } from '../repositories/contactRepository';

export const contactService = {
  getMyContacts: (email) => contactRepository.getMyContacts(email),
  sendContact: (data) => contactRepository.sendContact(data),
};

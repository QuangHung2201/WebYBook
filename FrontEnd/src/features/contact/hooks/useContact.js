import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { contactService } from '../services/contactService';

export function useContact() {
  const toast = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  const submitLock = useRef(false);

  const loadContacts = useCallback(async () => {
    if (!user) {
      setContacts([]);
      return;
    }
    setLoadingContacts(true);
    setContactsError(null);
    try {
      setContacts(await contactService.getMyContacts(user.email));
    } catch (error) {
      setContactsError(error.message || 'Không thể tải lịch sử liên hệ.');
    } finally {
      setLoadingContacts(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  const sendContact = async (data) => {
    if (submitLock.current) return false;
    submitLock.current = true;
    setSubmitting(true);
    try {
      const result = await contactService.sendContact(data);
      toast.success(result?.message || 'Gửi liên hệ thành công.');
      await loadContacts();
      return true;
    } catch (error) {
      toast.error(error.message || 'Không thể gửi liên hệ. Vui lòng thử lại.');
      return false;
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return { submitting, sendContact, contacts, loadingContacts, contactsError, reloadContacts: loadContacts };
}

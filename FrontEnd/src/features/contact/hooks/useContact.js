import { useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { contactService } from '../services/contactService';

export function useContact() {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const sendContact = async (data) => {
    setSubmitting(true);
    try {
      const result = await contactService.sendContact(data);
      toast.success(result?.message || 'Gửi liên hệ thành công.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Không thể gửi liên hệ. Vui lòng thử lại.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, sendContact };
}

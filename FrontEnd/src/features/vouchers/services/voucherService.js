import { voucherRepository } from '../repositories/voucherRepository';

export const voucherService = {
  getVouchers: () => voucherRepository.getVouchers(),
  getAvailableVouchers: (subtotal, includeUnavailable = false) => voucherRepository.getAvailableVouchers(subtotal, includeUnavailable),
  validateVoucher: (code, subtotal) => voucherRepository.validateVoucher({ code, subtotal }),
  createVoucher: (data) => voucherRepository.createVoucher(data),
  updateVoucher: (id, data) => voucherRepository.updateVoucher(id, data),
  deleteVoucher: (id) => voucherRepository.deleteVoucher(id),
};

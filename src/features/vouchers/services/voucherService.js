import { voucherRepository } from '../repositories/voucherRepository';

export const voucherService = {
  getVouchers: () => voucherRepository.getVouchers(),
  validateVoucher: (code, subtotal) => voucherRepository.validateVoucher({ code, subtotal }),
  createVoucher: (data) => voucherRepository.createVoucher(data),
  updateVoucher: (id, data) => voucherRepository.updateVoucher(id, data),
  deleteVoucher: (id) => voucherRepository.deleteVoucher(id),
};

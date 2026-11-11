import { orderRepository } from '../repositories/orderRepository';

export const orderService = {
  getOrders: (params = {}) => orderRepository.getOrders(params),
  getOrderById: (id, userId = null) => orderRepository.getOrderById(id, userId),
  createOrder: (data) => orderRepository.createOrder(data),
  updateStatus: (id, status) => orderRepository.updateStatus(id, status),
  cancelOrder: (id, userId = null) => orderRepository.cancelOrder(id, userId),
  confirmPayment: (id) => orderRepository.confirmPayment(id),
  createVnpayUrl: (id) => orderRepository.createVnpayUrl(id),
};

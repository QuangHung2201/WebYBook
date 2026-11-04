/**
 * @typedef {Object} OrderItem
 * @property {number|string} bookId
 * @property {string} title
 * @property {string} coverImage
 * @property {number} price
 * @property {number} qty
 *
 * @typedef {Object} Order
 * @property {number|string} id
 * @property {string} code
 * @property {number|string} userId
 * @property {string} customerName
 * @property {string} phone
 * @property {string} address
 * @property {OrderItem[]} items
 * @property {number} subtotal
 * @property {number} shippingFee
 * @property {number} discount
 * @property {number} total
 * @property {'PENDING'|'CONFIRMED'|'SHIPPING'|'DELIVERED'|'CANCELLED'} status
 * @property {string} paymentMethod
 * @property {string} shippingMethod
 * @property {string} voucherCode
 * @property {string} note
 * @property {string} createdAt
 * @property {string} updatedAt
 */
export {};

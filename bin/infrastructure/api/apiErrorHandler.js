export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const STATUS_MESSAGES = {
  400: 'Dữ liệu gửi lên không hợp lệ.',
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  409: 'Dữ liệu đã tồn tại hoặc xung đột.',
  422: 'Dữ liệu chưa đúng định dạng.',
  429: 'Bạn thao tác quá nhanh, vui lòng thử lại sau.',
  500: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
  503: 'Dịch vụ tạm thời không khả dụng.',
};

/**
 * Convert any axios/network error into a single predictable shape.
 */
export function normalizeApiError(error) {
  if (error instanceof ApiError) return error;

  if (error?.code === 'ECONNABORTED') {
    return new ApiError('Yêu cầu quá thời gian chờ. Vui lòng kiểm tra kết nối.', {
      code: 'TIMEOUT',
    });
  }

  if (!error?.response) {
    return new ApiError('Không kết nối được máy chủ. Vui lòng kiểm tra mạng.', {
      code: 'NETWORK',
      details: error?.message,
    });
  }

  const { status, data } = error.response;
  const message =
    data?.message ||
    data?.error ||
    STATUS_MESSAGES[status] ||
    'Đã có lỗi xảy ra. Vui lòng thử lại.';

  return new ApiError(message, {
    status,
    code: data?.code || `HTTP_${status}`,
    details: data?.details || null,
  });
}

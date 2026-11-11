package com.webybook.service;

import com.webybook.exception.BadRequestException;
import com.webybook.repository.CustomerCommerceRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
public class VnpayService {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final CustomerCommerceRepository repository;
    private final String tmnCode;
    private final String hashSecret;
    private final String paymentUrl;
    private final String returnUrl;

    public VnpayService(
            CustomerCommerceRepository repository,
            @Value("${app.vnpay.tmn-code:}") String tmnCode,
            @Value("${app.vnpay.hash-secret:}") String hashSecret,
            @Value("${app.vnpay.payment-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}") String paymentUrl,
            @Value("${app.vnpay.return-url:http://localhost:5173/payment/vnpay-return}") String returnUrl
    ) {
        this.repository = repository;
        this.tmnCode = tmnCode;
        this.hashSecret = hashSecret;
        this.paymentUrl = paymentUrl;
        this.returnUrl = returnUrl;
    }

    public String createPaymentUrl(long orderId, long userId, HttpServletRequest request) {
        Map<String, Object> order = repository.paymentOrder(orderId, userId);
        if (!"VNPAY".equalsIgnoreCase(String.valueOf(order.get("paymentMethod")))) {
            throw new BadRequestException("Đơn hàng không sử dụng VNPay");
        }
        if (!"unpaid".equalsIgnoreCase(String.valueOf(order.get("paymentStatus")))) {
            throw new BadRequestException("Đơn hàng không ở trạng thái chờ thanh toán");
        }
        if (tmnCode.isBlank() || hashSecret.isBlank()) {
            throw new BadRequestException("VNPay chưa được cấu hình");
        }

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", amount(order.get("total")));
        params.put("vnp_CreateDate", LocalDateTime.now().format(DATE_FORMAT));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_IpAddr", clientIp(request));
        params.put("vnp_Locale", "vn");
        params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_TxnRef", String.valueOf(orderId));
        String query = encode(params);
        return paymentUrl + "?" + query + "&vnp_SecureHash=" + hmacSha512(hashSecret, query);
    }

    public boolean handleCallback(Map<String, String> callback) {
        String providedHash = callback.get("vnp_SecureHash");
        if (providedHash == null || !providedHash.equalsIgnoreCase(hmacSha512(hashSecret, encodeWithoutHash(callback)))) {
            throw new BadRequestException("Chữ ký VNPay không hợp lệ");
        }
        long orderId = Long.parseLong(callback.get("vnp_TxnRef"));
        if ("00".equals(callback.get("vnp_ResponseCode")) && "00".equals(callback.get("vnp_TransactionStatus"))) {
            repository.markVnpayPaid(orderId, callback.getOrDefault("vnp_TransactionNo", callback.get("vnp_TxnRef")));
            return true;
        }
        repository.markVnpayFailed(orderId);
        return false;
    }

    private String encodeWithoutHash(Map<String, String> callback) {
        Map<String, String> filtered = new TreeMap<>();
        callback.forEach((key, value) -> {
            if (value != null && !value.isBlank() && !"vnp_SecureHash".equals(key) && !"vnp_SecureHashType".equals(key)) {
                filtered.put(key, value);
            }
        });
        return encode(filtered);
    }

    private String encode(Map<String, String> params) {
        return params.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String amount(Object value) {
        return new BigDecimal(String.valueOf(value)).movePointRight(2).toBigInteger().toString();
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }

    private String hmacSha512(String secret, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte value : digest) result.append(String.format("%02x", value));
            return result.toString();
        } catch (Exception exception) {
            throw new IllegalStateException("Không thể tạo chữ ký VNPay", exception);
        }
    }
}

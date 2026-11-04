package com.webybook.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final boolean mailEnabled;
    private final String fromAddress;

    public EmailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail.enabled:false}") boolean mailEnabled,
            @Value("${app.mail.from:no-reply@webybook.vn}") String fromAddress
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.mailEnabled = mailEnabled;
        this.fromAddress = fromAddress;
    }

    public void sendPasswordResetEmail(String to, String fullName, String resetLink, long ttlMinutes) {
        if (!mailEnabled) {
            log.info("[MAIL DEV] Link đặt lại mật khẩu cho {} ({}): {}", to, fullName, resetLink);
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new IllegalStateException("Chưa cấu hình SMTP nhưng MAIL_ENABLED=true");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("[WebYBook] Đặt lại mật khẩu");
        message.setText("""
                Xin chào %s,

                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản WebYBook của bạn.
                Vui lòng truy cập liên kết sau để đặt mật khẩu mới:
                %s

                Liên kết có hiệu lực trong %d phút và chỉ sử dụng được một lần.
                Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.

                Trân trọng,
                WebYBook
                """.formatted(fullName, resetLink, ttlMinutes));

        mailSender.send(message);
    }
}

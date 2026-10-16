package com.thecollegelife.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final RestClient restClient;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${collegelife.mail.resend.api-key:}")
    private String resendApiKey;

    @Value("${collegelife.mail.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${collegelife.mail.brevo.sender-email:aanandaaditya5@gmail.com}")
    private String brevoSenderEmail;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.restClient = RestClient.builder().build();
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info("Initiating password reset verification email for: {}", toEmail);

        String htmlBody = buildHtmlEmailTemplate(otpCode);

        // 1. Try Resend REST API (if key provided)
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            try {
                Map<String, Object> payload = Map.of(
                        "from", "The College Life <onboarding@resend.dev>",
                        "to", List.of(toEmail),
                        "subject", "Your Verification Code: " + otpCode + " — The College Life",
                        "html", htmlBody
                );

                restClient.post()
                        .uri("https://api.resend.com/emails")
                        .header("Authorization", "Bearer " + resendApiKey.trim())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .toBodilessEntity();

                log.info("✅ Resend API delivered OTP email successfully to {}", toEmail);
                return;
            } catch (Exception e) {
                log.error("❌ Resend API delivery failed: {}", e.getMessage());
            }
        }

        // 2. Try Brevo REST API (if key provided)
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            try {
                String sender = (brevoSenderEmail != null && !brevoSenderEmail.isBlank())
                        ? brevoSenderEmail.trim()
                        : "noreply@thecollegelife.app";

                Map<String, Object> payload = Map.of(
                        "sender", Map.of("name", "The College Life", "email", sender),
                        "to", List.of(Map.of("email", toEmail)),
                        "subject", "Your Verification Code: " + otpCode + " — The College Life",
                        "htmlContent", htmlBody
                );

                restClient.post()
                        .uri("https://api.brevo.com/v3/smtp/email")
                        .header("api-key", brevoApiKey.trim())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .toBodilessEntity();

                log.info("✅ Brevo API delivered OTP email successfully to {}", toEmail);
                return;
            } catch (Exception e) {
                log.error("❌ Brevo API delivery failed: {}", e.getMessage());
            }
        }

        // 3. Try standard JavaMailSender SMTP
        if (mailSender != null && senderEmail != null && !senderEmail.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(senderEmail, "The College Life");
                helper.setTo(toEmail);
                helper.setSubject("Your Verification Code: " + otpCode + " — The College Life");
                helper.setText(htmlBody, true);

                mailSender.send(message);
                log.info("✅ SMTP delivered OTP email successfully to {}", toEmail);
                return;
            } catch (Exception e) {
                log.error("❌ SMTP delivery failed: {}", e.getMessage());
            }
        }

        // 4. Fallback: Log clearly to console
        log.warn("=================================================================");
        log.warn("⚠️ NO EMAIL PROVIDER CONFIGURED.");
        log.warn("📨 Intended Recipient: {}", toEmail);
        log.warn("🔑 Verification Code: {}", otpCode);
        log.warn("💡 To deliver to physical inboxes, add RESEND_API_KEY or BREVO_API_KEY.");
        log.warn("=================================================================");
    }

    private String buildHtmlEmailTemplate(String otpCode) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 24px; background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e6edf3;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 28px 32px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #30363d; text-align: center;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #f43f5e; letter-spacing: -0.5px;">The College Life We Didn't Have</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px 32px 24px 32px;">
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #c9d1d9; line-height: 1.6;">Hello,</p>
                    <p style="margin: 0 0 24px 0; font-size: 15px; color: #c9d1d9; line-height: 1.6;">You requested a verification code to reset your account password. Use the single-use OTP below:</p>
                    
                    <div style="background-color: #0d1117; border: 1px solid #38bdf8; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; display: inline-block;">
                        """ + otpCode + """
                      </span>
                    </div>

                    <div style="background-color: rgba(244, 63, 94, 0.1); border-left: 3px solid #f43f5e; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; font-size: 13px; color: #fda4af; line-height: 1.5;">
                        <strong>Security Notice:</strong> You are allowed a maximum of <strong>2 attempts</strong> to verify this code. It will expire in <strong>10 minutes</strong>.
                      </p>
                    </div>

                    <p style="margin: 0; font-size: 13px; color: #8b949e; line-height: 1.5;">
                      If you did not request this verification code, please ignore this email or review your account security.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 32px; background-color: #0d1117; border-top: 1px solid #21262d; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #6e7681;">
                      The College Life We Didn't Have — Anonymous Campus Community
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
    }
}

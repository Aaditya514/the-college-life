package com.thecollegelife.service;

import com.thecollegelife.entity.PasswordResetOtp;
import com.thecollegelife.entity.User;
import com.thecollegelife.repository.PasswordResetOtpRepository;
import com.thecollegelife.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int MAX_ATTEMPTS = 2;

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetOtpRepository passwordResetOtpRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public Map<String, Object> requestOtp(String emailRaw) {
        String email = emailRaw.trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account registered with email: " + email));

        // Delete any active OTPs for this email to start a clean attempt cycle
        passwordResetOtpRepository.deleteByEmail(email);

        // Generate a 6-digit cryptographic numeric OTP
        int code = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(code);

        Instant expiresAt = Instant.now().plus(10, ChronoUnit.MINUTES);
        PasswordResetOtp record = new PasswordResetOtp(email, otp, expiresAt);
        passwordResetOtpRepository.save(record);

        // Dispatch real email to user's inbox
        emailService.sendOtpEmail(email, otp);

        return Map.of(
                "message", "A 6-digit verification code has been sent to " + email + ". Please check your inbox and spam folder.",
                "email", email,
                "expiresInSeconds", 600
        );
    }

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public Map<String, Object> verifyOtp(String emailRaw, String otpRaw) {
        String email = emailRaw.trim().toLowerCase();
        String enteredOtp = otpRaw.trim();

        PasswordResetOtp record = passwordResetOtpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("No verification code found for " + email + ". Please request a new one."));

        if (Instant.now().isAfter(record.getExpiresAt())) {
            passwordResetOtpRepository.delete(record);
            throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
        }

        if (record.getAttempts() >= MAX_ATTEMPTS) {
            passwordResetOtpRepository.delete(record);
            throw new IllegalArgumentException("Maximum attempts exceeded (2 of 2). This code has been invalidated. Please request a new code.");
        }

        if (!record.getOtpCode().equals(enteredOtp)) {
            int currentAttempts = record.getAttempts() + 1;
            record.setAttempts(currentAttempts);

            int remaining = MAX_ATTEMPTS - currentAttempts;
            if (remaining <= 0) {
                passwordResetOtpRepository.delete(record);
                throw new IllegalArgumentException("Incorrect verification code. Maximum 2 attempts reached. This code is now invalidated. Please request a new one.");
            } else {
                passwordResetOtpRepository.save(record);
                throw new IllegalArgumentException("Incorrect verification code. You have " + remaining + " try remaining.");
            }
        }

        // OTP matched! Generate single-use reset token
        String resetToken = UUID.randomUUID().toString();
        record.setVerified(true);
        record.setResetToken(resetToken);
        passwordResetOtpRepository.save(record);

        return Map.of(
                "message", "Verification code verified successfully. Please choose your new password.",
                "resetToken", resetToken,
                "email", email
        );
    }

    @Transactional
    public Map<String, Object> resetPassword(String emailRaw, String resetToken, String newPassword) {
        String email = emailRaw.trim().toLowerCase();

        PasswordResetOtp record = passwordResetOtpRepository.findByEmailAndResetToken(email, resetToken.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset session. Please request a new code."));

        if (!record.isVerified() || Instant.now().isAfter(record.getExpiresAt())) {
            passwordResetOtpRepository.delete(record);
            throw new IllegalArgumentException("Password reset session has expired. Please start over.");
        }

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));

        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        // Invalidate single-use token
        passwordResetOtpRepository.delete(record);

        log.info("✅ Password successfully updated for user: {}", email);

        return Map.of(
                "message", "Your password has been successfully updated! You can now sign in with your new password.",
                "email", email
        );
    }
}

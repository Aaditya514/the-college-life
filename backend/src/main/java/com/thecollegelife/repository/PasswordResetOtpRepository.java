package com.thecollegelife.repository;

import com.thecollegelife.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, UUID> {

    Optional<PasswordResetOtp> findTopByEmailOrderByCreatedAtDesc(String email);

    Optional<PasswordResetOtp> findByEmailAndResetToken(String email, String resetToken);

    void deleteByEmail(String email);
}

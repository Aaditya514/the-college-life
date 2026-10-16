package com.thecollegelife.controller;

import com.thecollegelife.dto.*;
import com.thecollegelife.security.UserPrincipal;
import com.thecollegelife.service.AuthService;
import com.thecollegelife.service.PasswordResetService;
import com.thecollegelife.service.PseudonymService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PseudonymService pseudonymService;
    private final PasswordResetService passwordResetService;

    public AuthController(
            AuthService authService,
            PseudonymService pseudonymService,
            PasswordResetService passwordResetService) {
        this.authService = authService;
        this.pseudonymService = pseudonymService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto dto) {
        AuthResponseDto response = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        AuthResponseDto response = authService.login(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/request")
    public ResponseEntity<Map<String, Object>> requestForgotPasswordOtp(@Valid @RequestBody ForgotPasswordRequestDto dto) {
        Map<String, Object> response = passwordResetService.requestOtp(dto.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody VerifyOtpRequestDto dto) {
        Map<String, Object> response = passwordResetService.verifyOtp(dto.getEmail(), dto.getOtp());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordDto dto) {
        Map<String, Object> response = passwordResetService.resetPassword(dto.getEmail(), dto.getResetToken(), dto.getNewPassword());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserDto userDto = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/generate-pseudonym")
    public ResponseEntity<Map<String, String>> generatePseudonym() {
        String pseudonym = pseudonymService.generateUniquePseudonym();
        return ResponseEntity.ok(Map.of("pseudonym", pseudonym));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponseDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody com.thecollegelife.dto.UpdateProfileDto dto) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AuthResponseDto response = authService.updateProfile(principal.getId(), dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody com.thecollegelife.dto.ChangePasswordRequestDto dto) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Map<String, String> response = authService.changePassword(principal.getId(), dto);
        return ResponseEntity.ok(response);
    }
}

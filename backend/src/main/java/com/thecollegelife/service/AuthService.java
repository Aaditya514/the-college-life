package com.thecollegelife.service;

import com.thecollegelife.dto.AuthResponseDto;
import com.thecollegelife.dto.LoginRequestDto;
import com.thecollegelife.dto.RegisterRequestDto;
import com.thecollegelife.dto.UserDto;
import com.thecollegelife.entity.User;
import com.thecollegelife.repository.UserRepository;
import com.thecollegelife.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PseudonymService pseudonymService;

    @Value("${app.jwt.expiration-ms:604800000}")
    private long jwtExpirationMs;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       PseudonymService pseudonymService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.pseudonymService = pseudonymService;
    }

    @Transactional
    public AuthResponseDto register(RegisterRequestDto dto) {
        String email = dto.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email " + email + " already exists.");
        }

        String pseudonym = dto.getPseudonym() != null && !dto.getPseudonym().isBlank()
                ? dto.getPseudonym().trim()
                : pseudonymService.generateUniquePseudonym();

        if (userRepository.findByPublicPseudonym(pseudonym).isPresent()) {
            // Append random suffix if requested pseudonym is taken
            pseudonym = pseudonym + " " + (10 + (int) (Math.random() * 90));
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setPublicPseudonym(pseudonym);
        user.setAvatarUrl(dto.getAvatarUrl());
        user.setRole("STUDENT");

        User saved = userRepository.save(user);

        String token = tokenProvider.generateTokenFromUserId(saved.getId(), saved.getEmail(), saved.getPublicPseudonym());
        return new AuthResponseDto(token, jwtExpirationMs, mapToUserDto(saved));
    }

    public AuthResponseDto login(LoginRequestDto dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getLogin().trim(), dto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(dto.getLogin().trim())
                .or(() -> userRepository.findByPublicPseudonym(dto.getLogin().trim()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new AuthResponseDto(token, jwtExpirationMs, mapToUserDto(user));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return mapToUserDto(user);
    }

    public UserDto mapToUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getPublicPseudonym(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public AuthResponseDto updateProfile(UUID userId, com.thecollegelife.dto.UpdateProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (dto.getPseudonym() != null && !dto.getPseudonym().isBlank()) {
            String requested = dto.getPseudonym().trim();
            userRepository.findByPublicPseudonym(requested).ifPresent(other -> {
                if (!other.getId().equals(userId)) {
                    throw new IllegalArgumentException("Pen name '" + requested + "' is already taken.");
                }
            });
            user.setPublicPseudonym(requested);
        }

        if (dto.getBio() != null) {
            user.setBio(dto.getBio().trim());
        }

        if (dto.getAvatarUrl() != null) {
            user.setAvatarUrl(dto.getAvatarUrl().trim());
        }

        User saved = userRepository.save(user);
        String token = tokenProvider.generateTokenFromUserId(saved.getId(), saved.getEmail(), saved.getPublicPseudonym());
        return new AuthResponseDto(token, jwtExpirationMs, mapToUserDto(saved));
    }

    @Transactional
    public java.util.Map<String, String> changePassword(UUID userId, com.thecollegelife.dto.ChangePasswordRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password does not match our records.");
        }

        if (passwordEncoder.matches(dto.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password cannot be the same as your current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
        return java.util.Map.of("message", "Your password has been changed successfully.");
    }
}

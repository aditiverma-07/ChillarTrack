package com.chillartrack.service.impl;

import com.chillartrack.dto.AuthDto;
import com.chillartrack.dto.UserDto;
import com.chillartrack.entity.RefreshToken;
import com.chillartrack.entity.User;
import com.chillartrack.exception.AppException;
import com.chillartrack.mapper.UserMapper;
import com.chillartrack.repository.RefreshTokenRepository;
import com.chillartrack.repository.UserRepository;
import com.chillartrack.security.JwtTokenProvider;
import com.chillartrack.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Override
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already registered", HttpStatus.CONFLICT);
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .emailVerificationToken(verificationToken)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);

        // Log verification token (email stub)
        log.info("📧 Email verification token for {}: {}", user.getEmail(), verificationToken);

        return buildAuthResponse(user);
    }

    @Override
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        return buildAuthResponse(user);
    }

    @Override
    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new AppException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED);
        }

        RefreshToken stored = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AppException("Refresh token not found", HttpStatus.UNAUTHORIZED));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException("Refresh token is revoked or expired", HttpStatus.UNAUTHORIZED);
        }

        User user = stored.getUser();
        // Revoke old token
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return buildAuthResponse(user);
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Override
    public void forgotPassword(AuthDto.ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setEmailVerificationToken(resetToken);
            userRepository.save(user);
            // Log reset token (email stub)
            log.info("🔑 Password reset token for {}: {}", user.getEmail(), resetToken);
        });
        // Always return success to prevent email enumeration
    }

    @Override
    public void resetPassword(AuthDto.ResetPasswordRequest request) {
        User user = userRepository.findByEmailVerificationToken(request.getToken())
                .orElseThrow(() -> new AppException("Invalid or expired reset token", HttpStatus.BAD_REQUEST));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    @Override
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new AppException("Invalid verification token", HttpStatus.BAD_REQUEST));

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    private AuthDto.AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken(user);

        // Revoke old refresh tokens and store new one
        refreshTokenRepository.revokeAllByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiresAt(LocalDateTime.now().plusSeconds(
                        jwtTokenProvider.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        UserDto.UserResponse userResponse = userMapper.toUserResponse(user);

        AuthDto.AuthResponse response = new AuthDto.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshTokenStr);
        response.setExpiresIn(jwtTokenProvider.getJwtExpirationMs() / 1000);
        response.setUser(userResponse);
        return response;
    }
}

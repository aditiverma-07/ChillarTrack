package com.chillartrack.service;

import com.chillartrack.dto.AuthDto;
import com.chillartrack.entity.RefreshToken;
import com.chillartrack.entity.User;
import com.chillartrack.exception.AppException;
import com.chillartrack.mapper.UserMapper;
import com.chillartrack.repository.RefreshTokenRepository;
import com.chillartrack.repository.UserRepository;
import com.chillartrack.security.JwtTokenProvider;
import com.chillartrack.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(UUID.randomUUID())
                .name("Test User")
                .email("test@example.com")
                .passwordHash("$2a$12$hashedpassword")
                .role(User.Role.USER)
                .emailVerified(true)
                .build();
    }

    @Test
    @DisplayName("Should throw conflict when registering with existing email")
    void register_shouldThrowConflict_whenEmailAlreadyExists() {
        // Given
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setName("Test User");
        request.setEmail("existing@example.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    @DisplayName("Should create user successfully on registration")
    void register_shouldCreateUser_whenValidRequest() {
        // Given
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setName("New User");
        request.setEmail("new@example.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token");
        when(jwtTokenProvider.getRefreshExpirationMs()).thenReturn(604800000L);
        when(jwtTokenProvider.getJwtExpirationMs()).thenReturn(900000L);
        when(refreshTokenRepository.save(any())).thenReturn(new RefreshToken());
        when(userMapper.toUserResponse(any())).thenReturn(new com.chillartrack.dto.UserDto.UserResponse());

        // When
        AuthDto.AuthResponse response = authService.register(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw when resetting with invalid token")
    void resetPassword_shouldThrow_whenTokenInvalid() {
        // Given
        AuthDto.ResetPasswordRequest request = new AuthDto.ResetPasswordRequest();
        request.setToken("invalid-token");
        request.setNewPassword("NewPass123");

        when(userRepository.findByEmailVerificationToken("invalid-token")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Invalid or expired reset token");
    }

    @Test
    @DisplayName("Should reset password when token is valid")
    void resetPassword_shouldUpdatePassword_whenValidToken() {
        // Given
        AuthDto.ResetPasswordRequest request = new AuthDto.ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("NewPass123");

        when(userRepository.findByEmailVerificationToken("valid-token")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("NewPass123")).thenReturn("$newHashedPassword");
        when(userRepository.save(any())).thenReturn(sampleUser);

        // When
        authService.resetPassword(request);

        // Then
        verify(userRepository).save(argThat(u -> u.getPasswordHash().equals("$newHashedPassword")));
    }

    @Test
    @DisplayName("Should not throw when forgot password email does not exist")
    void forgotPassword_shouldNotRevealIfEmailExists() {
        // Given
        AuthDto.ForgotPasswordRequest request = new AuthDto.ForgotPasswordRequest();
        request.setEmail("notexist@example.com");

        when(userRepository.findByEmail("notexist@example.com")).thenReturn(Optional.empty());

        // When - Should not throw (prevents email enumeration)
        assertThatNoException().isThrownBy(() -> authService.forgotPassword(request));
    }
}

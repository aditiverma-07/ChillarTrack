package com.chillartrack.service;

import com.chillartrack.dto.AuthDto;
import com.chillartrack.entity.User;

public interface AuthService {
    AuthDto.AuthResponse register(AuthDto.RegisterRequest request);
    AuthDto.AuthResponse login(AuthDto.LoginRequest request);
    AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request);
    void logout(String refreshToken);
    void forgotPassword(AuthDto.ForgotPasswordRequest request);
    void resetPassword(AuthDto.ResetPasswordRequest request);
    void verifyEmail(String token);
}

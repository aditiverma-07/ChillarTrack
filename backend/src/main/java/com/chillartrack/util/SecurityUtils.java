package com.chillartrack.util;

import com.chillartrack.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public class SecurityUtils {

    private SecurityUtils() {}

    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException("Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            // Principal username is email; we need userId from JWT
            // The JWT filter sets the user ID in the authentication name via UserDetailsServiceImpl#loadUserById
            // We store the UUID as the username directly in Principal
            try {
                return UUID.fromString(authentication.getName());
            } catch (IllegalArgumentException e) {
                // fallback: name is email, look up by another way
                throw new AppException("Cannot resolve user ID", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        throw new AppException("Not authenticated", HttpStatus.UNAUTHORIZED);
    }
}

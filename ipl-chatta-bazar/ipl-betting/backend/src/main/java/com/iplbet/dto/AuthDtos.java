package com.iplbet.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

// ===== AUTH DTOs =====
public class AuthDtos {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LoginResponse {
        private String token;
        private String username;
        private String role;
        private Double virtualBalance;
        private String fullName;
        private Long userId;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String fullName;
        private String email;
        private String phone;
    }
}

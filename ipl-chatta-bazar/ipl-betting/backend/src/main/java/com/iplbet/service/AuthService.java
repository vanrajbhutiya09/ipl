package com.iplbet.service;

import com.iplbet.dto.AuthDtos;
import com.iplbet.model.User;
import com.iplbet.repository.UserRepository;
import com.iplbet.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return AuthDtos.LoginResponse.builder()
            .token(token)
            .username(user.getUsername())
            .role(user.getRole().name())
            .virtualBalance(user.getVirtualBalance())
            .fullName(user.getFullName())
            .userId(user.getId())
            .build();
    }

    public User createAdminIfNotExists() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Super Admin")
                .email("admin@iplbet.com")
                .role(User.Role.ADMIN)
                .virtualBalance(0.0)
                .isActive(true)
                .build();
            return userRepository.save(admin);
        }
        return userRepository.findByUsername("admin").orElse(null);
    }
}

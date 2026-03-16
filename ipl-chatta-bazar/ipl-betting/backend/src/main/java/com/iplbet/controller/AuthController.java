package com.iplbet.controller;

import com.iplbet.dto.AuthDtos;
import com.iplbet.service.AuthService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostConstruct
    public void init() {
        authService.createAdminIfNotExists();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDtos.LoginRequest request) {
        try {
            AuthDtos.LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("status", "IPL Betting API is running!"));
    }
}

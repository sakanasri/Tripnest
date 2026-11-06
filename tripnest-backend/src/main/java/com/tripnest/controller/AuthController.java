package com.tripnest.controller;

import com.tripnest.dto.AuthResponse;
import com.tripnest.dto.LoginRequest;
import com.tripnest.dto.RegisterRequest;
import com.tripnest.model.User;
import com.tripnest.security.JwtService;
import com.tripnest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty() ||
            request.getName() == null || request.getName().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Name, email, and password are required.");
            return ResponseEntity.badRequest().body(err);
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userService.getUserByEmail(email) != null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "An account with email '" + email + "' already exists. Please sign in.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setAge(request.getAge() > 0 ? request.getAge() : 25);
        user.setEmail(email);
        user.setPassword(request.getPassword());
        user.setRole("ROLE_TRAVELER");

        User savedUser = userService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Email and password are required.");
            return ResponseEntity.badRequest().body(err);
        }

        String email = request.getEmail().trim().toLowerCase();
        User user = userService.loginUser(email, request.getPassword());

        if (user == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Invalid email or password. Please verify your credentials or register.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Email is required.");
            return ResponseEntity.badRequest().body(err);
        }
        return ResponseEntity.ok(userService.forgotPassword(email.trim().toLowerCase()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("newPassword");
        if (email == null || newPassword == null || newPassword.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Email and new password are required.");
            return ResponseEntity.badRequest().body(err);
        }
        return ResponseEntity.ok(userService.resetPassword(email.trim().toLowerCase(), newPassword));
    }
}
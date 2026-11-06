package com.tripnest.controller;

import com.tripnest.model.User;
import com.tripnest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // Register User
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // Login User
    @PostMapping("/login")
    public User loginUser(@RequestBody User user) {
        return userService.loginUser(
                user.getEmail(),
                user.getPassword()
        );
    }

    // Get Current User Profile
    @GetMapping("/profile")
    public User getProfile(@RequestParam(required = false) String email, Authentication authentication) {
        String userEmail = (email != null && !email.trim().isEmpty()) ? email.trim() : 
                           (authentication != null ? authentication.getName() : null);
        if (userEmail == null) {
            throw new RuntimeException("Email is required");
        }
        return userService.getUserByEmail(userEmail);
    }

    // Update Current User Profile
    @PutMapping("/profile")
    public User updateProfile(@RequestBody User user) {
        return userService.updateProfile(user);
    }

    // Change Password
    @PutMapping("/change-password")
    public Map<String, String> changePassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");
        return userService.changePassword(email, oldPassword, newPassword);
    }
}
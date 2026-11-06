package com.tripnest.service;

import com.tripnest.model.User;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().trim().toLowerCase());
        }
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("ROLE_TRAVELER");
        }
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        if (email == null || password == null) {
            return null;
        }

        User dbUser = userRepository.findByEmail(email.trim().toLowerCase());
        if (dbUser == null) {
            return null;
        }

        boolean passwordMatch = passwordEncoder.matches(password, dbUser.getPassword());
        if (passwordMatch) {
            return dbUser;
        }

        return null;
    }

    public User getUserByEmail(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email.trim().toLowerCase());
    }

    public User updateProfile(User userUpdate) {
        User existing = userRepository.findByEmail(userUpdate.getEmail());
        if (existing == null && userUpdate.getId() > 0) {
            existing = userRepository.findById(userUpdate.getId()).orElse(null);
        }
        if (existing == null) {
            throw new RuntimeException("User not found");
        }

        if (userUpdate.getName() != null) existing.setName(userUpdate.getName());
        if (userUpdate.getAge() > 0) existing.setAge(userUpdate.getAge());
        if (userUpdate.getTravelPreferences() != null) existing.setTravelPreferences(userUpdate.getTravelPreferences());
        if (userUpdate.getFavoriteDestinations() != null) existing.setFavoriteDestinations(userUpdate.getFavoriteDestinations());
        if (userUpdate.getBio() != null) existing.setBio(userUpdate.getBio());
        if (userUpdate.getPhoneNumber() != null) existing.setPhoneNumber(userUpdate.getPhoneNumber());

        return userRepository.save(existing);
    }

    public Map<String, String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email);
        Map<String, String> res = new HashMap<>();
        if (user == null) {
            res.put("status", "error");
            res.put("message", "No account registered with this email address");
            return res;
        }
        res.put("status", "success");
        res.put("message", "Reset authorization verified for: " + email);
        return res;
    }

    public Map<String, String> resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email);
        Map<String, String> res = new HashMap<>();
        if (user == null) {
            res.put("status", "error");
            res.put("message", "Account not found");
            return res;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        res.put("status", "success");
        res.put("message", "Password updated successfully. You can now login.");
        return res;
    }

    public Map<String, String> changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email);
        Map<String, String> res = new HashMap<>();
        if (user == null) {
            res.put("status", "error");
            res.put("message", "User not found");
            return res;
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            res.put("status", "error");
            res.put("message", "Current password does not match");
            return res;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        res.put("status", "success");
        res.put("message", "Password changed successfully");
        return res;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(int userId, String newRole) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }
}
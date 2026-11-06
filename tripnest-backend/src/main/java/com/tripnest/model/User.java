package com.tripnest.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    private int age;

    @Column(unique = true)
    private String email;

    private String password;

    private String role = "ROLE_TRAVELER";

    @Column(length = 1000)
    private String travelPreferences;

    @Column(length = 1000)
    private String favoriteDestinations;

    @Column(length = 500)
    private String bio;

    private String phoneNumber;

    public User() {
    }

    public User(int id, String name, int age, String email, String password) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.email = email;
        this.password = password;
        this.role = "ROLE_TRAVELER";
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getTravelPreferences() {
        return travelPreferences;
    }

    public void setTravelPreferences(String travelPreferences) {
        this.travelPreferences = travelPreferences;
    }

    public String getFavoriteDestinations() {
        return favoriteDestinations;
    }

    public void setFavoriteDestinations(String favoriteDestinations) {
        this.favoriteDestinations = favoriteDestinations;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
package com.tripnest.model;

import jakarta.persistence.*;

@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String message;

    private String status; // UNREAD, READ, ACCEPTED, DENIED

    // Links notification to the recipient user
    private Integer userId;

    // Type: "GENERAL" or "COLLAB_INVITE"
    private String type;

    // For COLLAB_INVITE: which trip the invite is for
    private Integer tripId;

    // For COLLAB_INVITE: who sent the invite (user id)
    private Integer fromUserId;

    public Notification() {
    }

    public Notification(String message, String status, Integer userId) {
        this.message = message;
        this.status = status;
        this.userId = userId;
        this.type = "GENERAL";
    }

    public Notification(String message, Integer userId, Integer tripId, Integer fromUserId) {
        this.message = message;
        this.status = "UNREAD";
        this.userId = userId;
        this.type = "COLLAB_INVITE";
        this.tripId = tripId;
        this.fromUserId = fromUserId;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getTripId() { return tripId; }
    public void setTripId(Integer tripId) { this.tripId = tripId; }

    public Integer getFromUserId() { return fromUserId; }
    public void setFromUserId(Integer fromUserId) { this.fromUserId = fromUserId; }
}
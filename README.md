# ✈️ TripNest: Travel Planning & Trip Management Platform

A full-stack travel platform built with **React.js + Vite** and **Spring Boot 3 + PostgreSQL**.

---

## 🛠️ How to Run via Command Prompt

Run the project using two separate Command Prompt (`cmd`) windows:

### 1. Ensure PostgreSQL is Running
Make sure your PostgreSQL service (`postgresql-x64-18`) is active:
```cmd
net start postgresql-x64-18
```
- **Database**: `tripnest`
- **Host**: `localhost:5432`
- **Username**: `postgres`
- **Password**: `Saki@123`

### 2. Start the Spring Boot Backend (Port 8081)
Open a terminal in `tripnest-backend`:
```cmd
cd tripnest-backend
.\mvnw.cmd spring-boot:run
```
*Wait until you see `Started TripnestApplication in ... seconds`.*

### 3. Start the React Frontend (Port 5173)
Open a second terminal in `tripnest-frontend`:
```cmd
cd tripnest-frontend
npm.cmd run dev
```
*Vite will start at `http://localhost:5173`.*

### 4. Open in Browser
Visit **[http://localhost:5173](http://localhost:5173)** in Chrome, Edge, or Firefox.

---

## 🔑 Login Accounts

| Role | Email | Password | Access Highlights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@tripnest.com` | `Admin@123` | Full access to 🛡️ **Admin Center**, platform metrics, user role management, destination catalog controls |
| **Administrator (Personal)** | `sakanasri07@gmail.com` | *(Your registered password)* | Full admin access and traveler trip management |
| **Traveler (Google)** | 1-Click Button | *None required* | Instant one-click Google OAuth demo traveler |

---

## 📋 Features & Milestone Checklist

- **Milestone 1**: JWT & OAuth2 login, Password recovery, Role-Based Access (`ROLE_TRAVELER`, `ROLE_ADMIN`), User Profile & Travel Preferences.
- **Milestone 2**: Trip creation, Day-wise itinerary planning, Interactive Leaflet GPS route map, Activity scheduling (Sightseeing, Transport, Hotel, Dining, Adventure, Shopping), Live Weather forecast widget & Travel guides.
- **Milestone 3**: Budget utilization tracking, Over-budget warning alerts, Group collaboration (Invite companions by email), In-app real-time group chat, Group expense splitting & "Mark as Settled" toggle, Centralized travel documents vault (tickets, hotel vouchers, passport/ID, photos).
- **Milestone 4**: Traveler Analytics Dashboard with Chart.js charts (Budget vs Actual spend, Category doughnut distribution), System Admin Dashboard with platform KPIs, user role assignment, and destination catalog management.
- **AI Features**: AI Trip Planner, AI Budget Estimator, AI Destination Recommendations, Document Assistant (with intelligent built-in fallback and Gemini API support).

-- ===========================================================
-- TripNest: PostgreSQL Schema & Data Migration
-- ===========================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    age INTEGER NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(255),
    travel_preferences VARCHAR(1000),
    favorite_destinations VARCHAR(1000),
    bio VARCHAR(500),
    phone_number VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS destination (
    id SERIAL PRIMARY KEY,
    country VARCHAR(255),
    description VARCHAR(1000),
    name VARCHAR(255),
    best_time_to_visit VARCHAR(255),
    category VARCHAR(255),
    estimated_budget VARCHAR(255),
    image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    budget DOUBLE PRECISION NOT NULL,
    destination VARCHAR(255),
    end_date VARCHAR(255),
    start_date VARCHAR(255),
    status VARCHAR(255),
    from_location VARCHAR(255),
    travellers INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS trip_collaborators (
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    collaborator_email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS itinerary (
    id SERIAL PRIMARY KEY,
    activity VARCHAR(255),
    day VARCHAR(255),
    time_slot VARCHAR(255),
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    activity_type VARCHAR(255),
    location VARCHAR(255),
    notes VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS expense (
    id SERIAL PRIMARY KEY,
    amount DOUBLE PRECISION,
    expense_name VARCHAR(255),
    category VARCHAR(255),
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    paid_by VARCHAR(255),
    split_amount DOUBLE PRECISION,
    is_settled BOOLEAN DEFAULT FALSE,
    notes VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    document_name VARCHAR(255),
    document_type VARCHAR(255),
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(255),
    file_url VARCHAR(255),
    uploaded_at TIMESTAMP,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    message TEXT,
    sender_email VARCHAR(255),
    sender_name VARCHAR(255),
    timestamp TIMESTAMP,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification (
    id SERIAL PRIMARY KEY,
    message VARCHAR(255),
    status VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    scheduled_date VARCHAR(255),
    location VARCHAR(255),
    notes VARCHAR(500),
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget (
    id SERIAL PRIMARY KEY,
    total_budget DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(255)
);

-- ===========================================================
-- TripNest: MySQL to PostgreSQL Migration Script
-- Generated automatically on 2026-10-15 20:21:23
-- ===========================================================

-- -----------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (1, 18, 'sakanasri07@gmail.com', 'saki', '$2a$10$LiVziv6qPaaZ1z2RD3Mr.uDbfUxWlYmW./TOzHlFWqiMleXwsiqdO', 'ROLE_ADMIN', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (2, 23, 'srinithi@gmail.com', 'Srinithi', '$2a$10$hz5A/ITv4Ta5Ls8HPHuUDe..WWe8RNEkqTLO5qljhVa81Y.0ED4r.', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (3, 17, 'sabahari@gmail.com', 'Sabhari', '$2a$10$lIIxLtaGjzXD4U4hGkgMyu3hTyffrmba.bHXc/Ui7uW1edEI5vQU6', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (4, 19, 'sakanasri@gmail.com', 'sakanasri', '$2a$10$PuTWhtPpzD65GN3H0voj5eRunRBusHDI87rqJ4UEg615v3aysuzi2', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (5, 18, 'saki@gmail.com', 'saki', '$2a$10$UyEZGcqSKFCEWmhFHaq6PeVD1yUyktBBsI9xZOAs6phaxLuxB8jea', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (6, 17, 'sabhari@gmail.com', 'sabhari', '$2a$10$q1t06Fs4JD2GZEkIiSzRweEMMsoX7t17StlNNHxOGEbIW53txjg4i', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (10, 34, 'srisaki777@gmail.com', 'saki', '$2a$10$EaqVWtCkJZPzr0wgm3Jv7OiXQeXv7ttet6oaq1JwZiKzXNiAlsIR.', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (24, 20, 'sabhari27@gmail.com', 'saki', '$2a$10$73X2DGcJ1uUiW3ORYBfPrOyck7QQptI.71bJKpRYl1BsdYk/9ZwPS', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (26, 17, 'sabharisasi027@gmail.com', 'Sabhari ', '$2a$10$UBoVQXcuh8JoyVsKdDJt4uYFLFD6061vE42eiRa2jzqfxh.habxnW', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (27, 20, 'srinithi12@gmail.com', 'Srinithi', '$2a$10$xgfnliN4j4xuKekqx0p7eekZqNs/NPRxXPc4v6CJ6JjGISFw6zveq', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (28, 20, 'sasi@gmail.com', 'sasi', '$2a$10$93yKAZbOVGGHzN6NAQnZaeLEgCPkiJa2CHEBbrqZESEZygeHHZSe.', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (29, 19, 'arshin@gmail.com', 'Arshin', '$2a$10$lyqspOdqigXcDeg20ZEAF.0IfBx0baCE5oUvukchSMPRHES8PgdDy', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (30, 30, 'admin@tripnest.com', 'Platform Administrator', '$2a$10$8pf2Iq786w4dZyofnd.eU.rpUYdCazakW3Qgfc1Tg0foif3Xzs.ny', 'ROLE_ADMIN', 'Heritage, Hill Stations, Coastal Escapes', 'Goa, Manali, Ladakh', 'Lead System Administrator for TripNest Travel Platform', '+91 9876543210');
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (31, 25, 'narmadha@gmail.com', 'Nar', '$2a$10$6DFDGqdBe5fsM/5f1z/CduYYe.l1ujuInJykUI1lc6ZoW1755ECyS', 'ROLE_TRAVELER', NULL, NULL, NULL, NULL);
INSERT INTO users ("id", "age", "email", "name", "password", "role", "travel_preferences", "favorite_destinations", "bio", "phone_number") VALUES (32, 25, 'traveler.google@tripnest.com', 'Alex Rivera', '$2a$10$.BVKkno82DTqs0.OzRIfrO/xqjl1faNxpqfJbaO0j7mOuqTMdYxIe', 'ROLE_TRAVELER', 'Beach & Coastline, Hill Stations, Adventure', NULL, NULL, NULL);
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;

-- -----------------------------------------------------------
-- Table: destination
-- -----------------------------------------------------------
INSERT INTO destination ("id", "country", "description", "name", "best_time_to_visit", "category", "estimated_budget", "image_url") VALUES (1, 'India', 'Famous for pristine sandy beaches, vibrant nightlife, water sports, and Portuguese colonial architecture.', 'Goa', 'November ? February', 'Beach & Nightlife', '?15,000 ? ?35,000', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600');
INSERT INTO destination ("id", "country", "description", "name", "best_time_to_visit", "category", "estimated_budget", "image_url") VALUES (2, 'India', 'Known as the Queen of Hill Stations, featuring serene tea gardens, Nilgiri Toy Train, and lush botanical gardens.', 'Ooty', 'October ? June', 'Hill Station & Nature', '?10,000 ? ?25,000', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600');
INSERT INTO destination ("id", "country", "description", "name", "best_time_to_visit", "category", "estimated_budget", "image_url") VALUES (3, 'India', 'High-altitude Himalayan resort town known for snow-capped mountain vistas, paragliding, and Solang Valley adventures.', 'Manali', 'October ? June', 'Adventure & Mountains', '?20,000 ? ?45,000', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600');
INSERT INTO destination ("id", "country", "description", "name", "best_time_to_visit", "category", "estimated_budget", "image_url") VALUES (4, 'India', 'Experience tranquil houseboat cruises through palm-fringed backwaters, spice plantations, and Ayurvedic wellness.', 'Kerala Backwaters', 'September ? March', 'Relaxation & Culture', '?18,000 ? ?40,000', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600');
INSERT INTO destination ("id", "country", "description", "name", "best_time_to_visit", "category", "estimated_budget", "image_url") VALUES (5, 'India', 'The iconic Pink City featuring majestic palaces like Hawa Mahal, Amer Fort, vibrant bazaars, and royal heritage.', 'Jaipur', 'October ? March', 'Heritage & Culture', '?12,000 ? ?30,000', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600');
SELECT setval(pg_get_serial_sequence('destination', 'id'), COALESCE(MAX(id), 1)) FROM destination;

-- -----------------------------------------------------------
-- Table: trips
-- -----------------------------------------------------------
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (1, 10000, 'manali', '2026-07-21', '2026-07-13', 'Planned', NULL, 0, NULL);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (2, 10000, 'manali', '2026-07-18', '2026-07-13', 'Planned', NULL, 0, NULL);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (3, 0, '', '', '', NULL, '', 0, NULL);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (4, 100000, 'manali', '2026-08-01', '2026-07-17', NULL, 'pollachi', 3, NULL);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (5, 50000, 'manali', '2026-07-25', '2026-07-21', NULL, 'pollachi', 5, 2);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (6, 1000, 'manali', '2026-07-24', '2026-07-22', NULL, 'pollachi', 2, 2);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (7, 10000, 'manali', '2026-07-25', '2026-07-24', NULL, 'pollachi', 2, 5);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (8, 10000, 'manali', '2026-07-31', '2026-07-27', NULL, 'pollachi', 3, 6);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (9, 11997, 'manali', '2026-07-30', '2026-07-28', NULL, 'pollachi', 5, 6);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (10, 20006, 'manali', '20027-08-23', '2027-07-07', NULL, 'pollachi', 3, 10);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (14, 20000, 'ooty', '2026-08-20', '2026-08-18', NULL, 'namakkal', 4, 10);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (16, 20000, 'manali', '2026-08-19', '2026-08-17', NULL, 'pollachi', 2, 24);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (21, 20000, 'Goa', '2026-08-21', '2026-08-20', NULL, 'pollachi', 2, 10);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (22, 20000, 'ooty', '2026-08-21', '2026-08-20', NULL, 'pollachi', 2, 27);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (23, 20000, 'ooty', '2026-08-21', '2026-08-20', NULL, 'coimbatore', 2, 28);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (24, 30000, 'manali', '2026-11-14', '2026-11-01', NULL, 'Bangalore', 8, 29);
INSERT INTO trips ("id", "budget", "destination", "end_date", "start_date", "status", "from_location", "travellers", "user_id") VALUES (25, 20000, 'ooty', '2026-10-21', '2026-10-15', 'Planned', 'pollachi', 3, 29);
SELECT setval(pg_get_serial_sequence('trips', 'id'), COALESCE(MAX(id), 1)) FROM trips;

-- -----------------------------------------------------------
-- Table: trip_collaborators
-- -----------------------------------------------------------
INSERT INTO trip_collaborators ("trip_id", "collaborator_email") VALUES (10, 'sakanasri07@gmail.com');
INSERT INTO trip_collaborators ("trip_id", "collaborator_email") VALUES (14, 'sabhari27@gmail.com');
INSERT INTO trip_collaborators ("trip_id", "collaborator_email") VALUES (21, 'sakanasri07@gmail.com');
INSERT INTO trip_collaborators ("trip_id", "collaborator_email") VALUES (23, 'srisaki777@gmail.com');
INSERT INTO trip_collaborators ("trip_id", "collaborator_email") VALUES (24, 'srisaki777@gmail.com');
INSERT INTO trip_collaborators ("trip_id", "collaborator_email") VALUES (25, 'narmadha@gmail.com');

-- -----------------------------------------------------------
-- Table: itinerary
-- -----------------------------------------------------------
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (2, 'beach', 'Day 1', 'Morning', 10, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (10, 'hotel view', 'Day 1', 'Morning', 14, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (11, 'lunch', 'Day 1', 'Afternoon', 14, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (12, 'dj', 'Day 1', 'Night', 14, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (13, 'sunrise', 'Day 2', 'Morning', 14, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (14, 'beach', 'Day 1', 'Evening', 14, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (15, 'brakfast', 'Day 3', 'Morning', 14, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (16, 'scuba', 'Day 1', 'Evening', 14, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (25, 'sunrise', 'Day 1', 'Morning', 21, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (26, 'scuba', 'Day 1', 'Afternoon', 21, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (27, 'candle light dinner', 'Day 1', 'Night', 21, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (29, 'sunrise', 'Day 1', 'Morning', 22, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (30, 'lunch', 'Day 1', 'Afternoon', 22, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (31, 'boating', 'Day 1', 'Evening', 22, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (33, 'sunrise', 'Day 1', 'Morning', 23, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (34, 'park ', 'Day 1', 'Afternoon', 23, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (35, 'boating', 'Day 1', 'Evening', 23, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (36, 'campfire', 'Day 1', 'Night', 23, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (38, 'sunrise', 'Day 1', 'Morning', 24, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (39, 'lunch', 'Day 1', 'Afternoon', 24, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (40, 'surfing', 'Day 1', 'Evening', 24, 'Sightseeing', NULL, NULL);
INSERT INTO itinerary ("id", "activity", "day", "time_slot", "trip_id", "activity_type", "location", "notes") VALUES (41, 'fire camp', 'Day 1', 'Night', 24, 'Sightseeing', NULL, NULL);
SELECT setval(pg_get_serial_sequence('itinerary', 'id'), COALESCE(MAX(id), 1)) FROM itinerary;

-- -----------------------------------------------------------
-- Table: expense
-- -----------------------------------------------------------
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (1, 8993, 'hotel', 'Accommodation', 10, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (2, 1000, 'firecamp', 'Activities', 10, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (3, 10000, 'food', 'Accommodation', 10, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (4, 1000, 'sports', 'Accommodation', 10, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (10, 5000, 'stay', 'Accommodation', 14, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (11, 5000, 'food', 'Food & Dining', 14, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (12, 2000, 'beach and activity', 'Accommodation', 14, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (14, 5000, 'drive', 'Transportation', 14, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (18, 5000, 'staying room', 'Accommodation', 21, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (19, 2000, 'lunch', 'Food & Dining', 21, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (20, 2000, 'hotel stay', 'Accommodation', 22, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (21, 5000, 'food in hotel', 'Food & Dining', 22, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (23, 5000, 'bating and activities', 'Activities', 22, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (24, 2000, 'transportation in bus', 'Transportation', 23, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (25, 5000, 'food in hotel', 'Food & Dining', 23, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (26, 5000, 'hostel stay', 'Accommodation', 23, NULL, NULL, FALSE, NULL);
INSERT INTO expense ("id", "amount", "expense_name", "category", "trip_id", "paid_by", "split_amount", "is_settled", "notes") VALUES (29, 2000, 'sunrise', 'Accommodation', 24, NULL, NULL, FALSE, NULL);
SELECT setval(pg_get_serial_sequence('expense', 'id'), COALESCE(MAX(id), 1)) FROM expense;

-- -----------------------------------------------------------
-- Table: documents
-- -----------------------------------------------------------
INSERT INTO documents ("id", "document_name", "document_type", "file_name", "file_size", "file_type", "file_url", "uploaded_at", "trip_id") VALUES (1, 'Java_Travel Planning & Trip Management Platform (1) (1).pdf', 'Ticket', 'c6438b22-f3f0-462a-a368-f9a3e852f39f_Java_Travel Planning & Trip Management Platform (1) (1).pdf', 1025017, 'application/pdf', '/documents/download/c6438b22-f3f0-462a-a368-f9a3e852f39f_Java_Travel Planning & Trip Management Platform (1) (1).pdf', '2026-08-16 19:59:54.832352', 10);
INSERT INTO documents ("id", "document_name", "document_type", "file_name", "file_size", "file_type", "file_url", "uploaded_at", "trip_id") VALUES (2, 'pass', 'Hotel Booking', '5729dad6-0862-47c0-ae73-6d1d3f627b09_New Text Document.txt', 0, 'text/plain', '/documents/download/5729dad6-0862-47c0-ae73-6d1d3f627b09_New Text Document.txt', '2026-08-17 16:45:32.740903', 14);
INSERT INTO documents ("id", "document_name", "document_type", "file_name", "file_size", "file_type", "file_url", "uploaded_at", "trip_id") VALUES (5, 'rules and regulations', 'Other', '82a95f51-b46f-456e-82e8-a0356f1cf8e5_New Text Document.txt', 0, 'text/plain', '/documents/download/82a95f51-b46f-456e-82e8-a0356f1cf8e5_New Text Document.txt', '2026-08-17 16:59:26.793153', 23);
INSERT INTO documents ("id", "document_name", "document_type", "file_name", "file_size", "file_type", "file_url", "uploaded_at", "trip_id") VALUES (6, 'New Text Document.txt', 'Ticket', '30ba7192-71f9-4479-b7dd-4b676afcb54e_New Text Document.txt', 0, 'text/plain', '/documents/download/30ba7192-71f9-4479-b7dd-4b676afcb54e_New Text Document.txt', '2026-08-17 17:01:53.513610', 23);
SELECT setval(pg_get_serial_sequence('documents', 'id'), COALESCE(MAX(id), 1)) FROM documents;

-- -----------------------------------------------------------
-- Table: chat_messages
-- -----------------------------------------------------------
INSERT INTO chat_messages ("id", "message", "sender_email", "sender_name", "timestamp", "trip_id") VALUES (1, 'hii', 'srisaki777@gmail.com', 'saki', '2026-08-17 14:22:12.941400', 14);
INSERT INTO chat_messages ("id", "message", "sender_email", "sender_name", "timestamp", "trip_id") VALUES (2, 'hello', 'sabhari27@gmail.com', 'saki', '2026-08-17 14:24:44.311136', 14);
INSERT INTO chat_messages ("id", "message", "sender_email", "sender_name", "timestamp", "trip_id") VALUES (3, 'hi', 'srisaki777@gmail.com', 'saki', '2026-08-17 16:42:33.625423', 21);
INSERT INTO chat_messages ("id", "message", "sender_email", "sender_name", "timestamp", "trip_id") VALUES (4, 'we are a planning a trip to goa', 'srisaki777@gmail.com', 'saki', '2026-08-17 16:42:48.108914', 21);
INSERT INTO chat_messages ("id", "message", "sender_email", "sender_name", "timestamp", "trip_id") VALUES (5, 'are u guys ready?', 'srisaki777@gmail.com', 'saki', '2026-08-17 16:42:55.271072', 21);
INSERT INTO chat_messages ("id", "message", "sender_email", "sender_name", "timestamp", "trip_id") VALUES (6, 'hi are u guys ready for the trip?', 'sasi@gmail.com', 'sasi', '2026-08-17 17:00:03.968912', 23);
INSERT INTO chat_messages ("id", "message", "sender_email", "sender_name", "timestamp", "trip_id") VALUES (7, 'yes!!', 'srisaki777@gmail.com', 'saki', '2026-08-17 17:01:34.969346', 23);
INSERT INTO chat_messages ("id", "message", "sender_email", "sender_name", "timestamp", "trip_id") VALUES (8, 'hii', 'arshin@gmail.com', 'Arshin', '2026-10-14 12:24:40.108833', 25);
SELECT setval(pg_get_serial_sequence('chat_messages', 'id'), COALESCE(MAX(id), 1)) FROM chat_messages;

-- -----------------------------------------------------------
-- Table: notification
-- -----------------------------------------------------------
INSERT INTO notification ("id", "message", "status") VALUES (1, '? New Trip Scheduled: Expedition to ooty from 2026-08-09 to 2026-08-12', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (2, '?? Budget Exceeded Alert: Total expenses (?52000) for trip to ooty have exceeded budget limit (?15000).', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (3, '? You were added as a co-traveler to trip: ooty by srisaki777@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (4, '? You were added as a co-traveler to trip: ooty by srisaki777@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (5, '? You were added as a co-traveler to trip: ooty by srisaki777@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (6, '? New Trip Scheduled: Expedition to goa from 2026-08-12 to 2026-08-15', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (7, '? You were added as a co-traveler to trip: goa by srisaki777@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (8, '? New Trip Scheduled: Expedition to ooty from 2026-08-08 to 2026-08-10', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (9, '? You were added as a co-traveler to trip: ooty by srisaki777@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (10, '? New Document Uploaded: Java_Travel Planning & Trip Management Platform (1) (1).pdf (Ticket) for trip to manali', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (11, '? You were added as a co-traveler to trip: manali by srisaki777@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (12, '? New Trip Scheduled: Expedition to ooty from 2026-08-18 to 2026-08-20', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (13, '? New Activity Added: hotel view (Day 1 - Morning) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (14, '? New Activity Added: lunch (Day 1 - Afternoon) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (15, '? New Activity Added: dj (Day 1 - Night) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (16, '? New Activity Added: sunrise (Day 2 - Morning) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (17, '? New Activity Added: beach (Day 1 - Evening) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (18, '? New Activity Added: brakfast (Day 3 - Morning) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (19, '? New Activity Added: scuba (Day 1 - Evening) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (20, '?? Budget Exceeded Alert: Total expenses (?62000) for trip to ooty have exceeded budget limit (?20000).', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (21, '? You were added as a co-traveler to trip: ooty by srisaki777@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (22, '? New Trip Scheduled: Expedition to Kerala Backwaters from 2026-08-17 to 2026-08-20', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (23, '? New Activity Added: beach (Day 1 - Morning) for trip to Kerala Backwaters', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (24, '? New Activity Added: scuba (Day 1 - Afternoon) for trip to Kerala Backwaters', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (25, '? New Activity Added: watershow (Day 1 - Night) for trip to Kerala Backwaters', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (26, '? New Activity Added: sunrise (Day 2 - Morning) for trip to Kerala Backwaters', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (27, '? New Trip Scheduled: Expedition to manali from 2026-08-17 to 2026-08-19', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (28, '? New Trip Scheduled: Expedition to goa from 2026-08-20 to 2026-08-21', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (29, '? New Trip Scheduled: Expedition to Goa from 2026-08-20 to 2026-08-22', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (30, '? New Activity Added: sunrise (Day 1 - Morning) for trip to Goa', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (31, '? New Activity Added: lunch (Day 1 - Afternoon) for trip to Goa', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (32, '? New Activity Added: dj (Day 1 - Night) for trip to Goa', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (33, '? New Activity Added: hills (Day 2 - Morning) for trip to Goa', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (34, '? New Trip Scheduled: Expedition to paris from 2026-08-17 to 2026-08-20', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (35, '? New Trip Scheduled: Expedition to goa from 2026-08-18 to 2026-09-10', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (36, '?? Budget Exceeded Alert: Total expenses (?76000) for trip to goa have exceeded budget limit (?19999).', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (37, '? New Trip Scheduled: Expedition to Goa from 2026-08-20 to 2026-08-21', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (38, '? New Activity Added: sunrise (Day 1 - Morning) for trip to Goa', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (39, '? New Activity Added: scuba (Day 1 - Afternoon) for trip to Goa', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (40, '? New Activity Added: candle light dinner (Day 1 - Night) for trip to Goa', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (41, '? New Activity Added: hill visit (Day 2 - Morning) for trip to Goa', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (42, '? You were added as a co-traveler to trip: Goa by srisaki777@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (43, '? You were added as a co-traveler to trip: Goa by srisaki777@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (44, '? New Document Uploaded: pass (Hotel Booking) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (45, '? New Trip Scheduled: Expedition to ooty from 2026-08-20 to 2026-08-21', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (46, '? New Activity Added: sunrise (Day 1 - Morning) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (47, '? New Activity Added: lunch (Day 1 - Afternoon) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (48, '? New Activity Added: boating (Day 1 - Evening) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (49, '? New Activity Added: dj (Day 2 - Night) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (50, '? New Document Uploaded: ticket (Ticket) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (51, '? New Document Uploaded: walpaper.jpg (Ticket) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (52, '? New Trip Scheduled: Expedition to ooty from 2026-08-20 to 2026-08-21', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (53, '? New Activity Added: sunrise (Day 1 - Morning) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (54, '? New Activity Added: park  (Day 1 - Afternoon) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (55, '? New Activity Added: boating (Day 1 - Evening) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (56, '? New Activity Added: campfire (Day 1 - Night) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (57, '? New Activity Added: beach (Day 2 - Morning) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (58, '? New Document Uploaded: rules and regulations (Other) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (59, '? You were added as a co-traveler to trip: ooty by sasi@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (60, '? New Document Uploaded: New Text Document.txt (Ticket) for trip to ooty', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (61, '? New Trip Scheduled: Expedition to manali from 2026-11-01 to 2026-11-14', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (62, '? New Activity Added: sunrise (Day 1 - Morning) for trip to manali', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (63, '? New Activity Added: lunch (Day 1 - Afternoon) for trip to manali', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (64, '? New Activity Added: surfing (Day 1 - Evening) for trip to manali', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (65, '? New Activity Added: fire camp (Day 1 - Night) for trip to manali', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (66, '? You were added as a co-traveler to trip: manali by arshin@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (67, '? New Trip Scheduled: Expedition to ooty from 2026-10-15 to 2026-10-21', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (68, '? You were added as a co-traveler to trip: ooty by arshin@gmail.com', 'READ');
INSERT INTO notification ("id", "message", "status") VALUES (69, '? New message from Arshin: hii', 'READ');
SELECT setval(pg_get_serial_sequence('notification', 'id'), COALESCE(MAX(id), 1)) FROM notification;



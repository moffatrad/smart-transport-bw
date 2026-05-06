-- Smart Transport BW Database Schema (Neon PostgreSQL)

-- Create enum types used by the schema
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('passenger', 'driver');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
        CREATE TYPE vehicle_type AS ENUM ('taxi', 'combi', 'bus');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_status') THEN
        CREATE TYPE trip_status AS ENUM ('requested', 'accepted', 'started', 'completed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
        CREATE TYPE alert_type AS ENUM ('sos', 'trip_share', 'check_in');
    END IF;
END$$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type user_type NOT NULL DEFAULT 'passenger',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type vehicle_type NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    operating_base VARCHAR(100),
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    rating NUMERIC(2,1) NOT NULL DEFAULT 0,
    total_trips INT NOT NULL DEFAULT 0
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id BIGSERIAL PRIMARY KEY,
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    distance_km NUMERIC(10,2),
    duration_minutes INT,
    fare NUMERIC(10,2),
    vehicle_type vehicle_type
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id BIGSERIAL PRIMARY KEY,
    passenger_id BIGINT REFERENCES users(id),
    driver_id BIGINT REFERENCES drivers(id),
    route_id BIGINT REFERENCES routes(id),
    status trip_status NOT NULL DEFAULT 'requested',
    fare NUMERIC(10,2),
    seats_booked INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Bookings Table (Inter-city buses)
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    from_city VARCHAR(50) NOT NULL,
    to_city VARCHAR(50) NOT NULL,
    departure_date DATE NOT NULL,
    seat_number INT NOT NULL,
    fare NUMERIC(10,2) NOT NULL,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    status booking_status NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Safety Alerts Table
CREATE TABLE IF NOT EXISTS safety_alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    alert_type alert_type NOT NULL,
    location_lat NUMERIC(10,8),
    location_lng NUMERIC(11,8),
    contacts_notified TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Data
INSERT INTO routes (from_location, to_location, distance_km, duration_minutes, fare, vehicle_type) VALUES
('Gaborone Bus Rank', 'University of Botswana', 8.5, 15, 10.00, 'taxi'),
('Gaborone Bus Rank', 'University of Botswana', 9.2, 22, 9.00, 'combi'),
('Gaborone', 'Francistown', 435, 390, 168.00, 'bus'),
('Gaborone', 'Maun', 860, 720, 331.00, 'bus')
ON CONFLICT DO NOTHING;

-- Insert sample users
INSERT INTO users (name, email, phone, password, user_type) VALUES
('John Modise', 'john@example.com', '+26771234567', '$2y$10$encrypted', 'driver'),
('Pearl Phillimon', 'pearl@example.com', '+26771234568', '$2y$10$encrypted', 'passenger')
ON CONFLICT (email) DO NOTHING;
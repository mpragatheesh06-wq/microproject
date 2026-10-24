-- ===============================================
-- SMARTROUTE — SUPABASE DATABASE SCHEMA SETUP
-- Execute this SQL script in your Supabase SQL Editor
-- ===============================================

-- 1. Enable PostGIS extension for spatial queries (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    phone VARCHAR(50),
    available_er_beds INT DEFAULT 10,
    icu_available BOOLEAN DEFAULT TRUE,
    hospital_type VARCHAR(100) DEFAULT 'General Hospital',
    specializations TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. AMBULANCES TABLE
CREATE TABLE IF NOT EXISTS ambulances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_code VARCHAR(50) UNIQUE NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(50),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    current_status VARCHAR(50) DEFAULT 'Available', -- Available, Busy, Maintenance
    current_assignment VARCHAR(255),
    kit_loaded TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. EMERGENCY INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    patient_name VARCHAR(150),
    age INT,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    contact_number VARCHAR(50),
    emergency_type VARCHAR(100) NOT NULL,
    disease_name TEXT,
    severity_level VARCHAR(20) NOT NULL, -- low, medium, high, critical
    patient_address TEXT,
    patient_latitude NUMERIC(10, 6),
    patient_longitude NUMERIC(10, 6),
    selected_hospital_id UUID REFERENCES hospitals(id),
    assigned_ambulance_id UUID REFERENCES ambulances(id),
    recommended_kit JSONB,
    status VARCHAR(50) DEFAULT 'Dispatched', -- Dispatched, En Route, Arrived, Resolved
    route_distance_km NUMERIC(5, 2),
    estimated_eta_seconds INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ROUTE LOGS / DAA TRAVERSAL LOGS TABLE
CREATE TABLE IF NOT EXISTS route_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    algorithm_used VARCHAR(50) DEFAULT 'Dijkstra Shortest Path',
    nodes_traversed JSONB,
    total_cost NUMERIC(8, 2),
    rerouted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Seed Hospitals
INSERT INTO hospitals (name, address, latitude, longitude, phone, available_er_beds, icu_available, hospital_type, specializations, status)
VALUES 
('Central General Hospital', '102 Healthcare Blvd, City Center', 12.9716, 77.5946, '+91 98765 00001', 14, true, 'Trauma Center', 'Trauma, Cardiac, Emergency', 'active'),
('City Medical Center', '45 Station Road, North District', 12.9820, 77.6010, '+91 98765 00002', 8, true, 'General Hospital', 'Surgery, Internal Medicine', 'active'),
('Apollo Multi-Specialty Hospital', '88 Tech Park Way, East Ave', 12.9550, 77.6320, '+91 98765 00003', 5, true, 'Specialty Care', 'Neurology, Oncology, Pediatrics', 'active'),
('St. Jude Emergency Clinic', '12 Riverbank Road, South Ward', 12.9300, 77.5800, '+91 98765 00004', 2, false, 'Emergency Only', 'Triage, First Response', 'full');

-- Insert Sample Seed Ambulances
INSERT INTO ambulances (unit_code, driver_name, driver_phone, latitude, longitude, current_status, kit_loaded)
VALUES 
('AMB-101', 'Rajesh Kumar', '+91 98111 00001', 12.9650, 77.5890, 'Available', 'Cardiac & Trauma Kit'),
('AMB-102', 'Vikram Singh', '+91 98111 00002', 12.9780, 77.6050, 'Busy', 'Burn & Fracture Kit'),
('AMB-103', 'Suresh Patel', '+91 98111 00003', 12.9400, 77.6150, 'Available', 'Universal First-Aid Pack');

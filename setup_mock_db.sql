CREATE TABLE hotels (
    hotel_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE BOOKING_STATUS AS ENUM('confirmed','pending','canceled', 'rejected', 'scheduled');


CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    hotel_id INT REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    room_type VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE amenities (
    amenity_id SERIAL PRIMARY KEY,
    hotel_id INT REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    preferences TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(room_id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    booking_date DATE not null,
    status BOOKING_STATUS NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO hotels (name, location, star_rating) VALUES
('Grand Hotel', 'New York', 5),
('Ocean View Resort', 'Miami', 4),
('Mountain Retreat', 'Aspen', 4),
('City Center Inn', 'San Francisco', 3),
('Budget Stay', 'Las Vegas', 2),
('Luxury Suites', 'Los Angeles', 5),
('Cozy Cottage', 'Lake Tahoe', 3),
('Historic Hotel', 'New Orleans', 4),
('Business Hotel', 'Chicago', 3),
('Family Friendly Hotel', 'Orlando', 4);


INSERT INTO rooms (hotel_id, room_type, price, availability) VALUES
(1, 'Single', 100.00, true),
(1, 'Double', 150.00, true),
(1, 'Suite', 250.00, true),
(2, 'Single', 90.00, true),
(2, 'Double', 140.00, true),
(2, 'Suite', 230.00, false),
(3, 'Single', 110.00, true),
(3, 'Double', 160.00, true),
(3, 'Suite', 270.00, true),
(4, 'Single', 95.00, true),
(4, 'Double', 145.00, true),
(4, 'Suite', 240.00, true),
(5, 'Single', 120.00, false),
(5, 'Double', 175.00, true),
(5, 'Suite', 300.00, true);

INSERT INTO amenities (hotel_id, amenity_name, description) VALUES
(1, 'Free WiFi', 'Complimentary high-speed internet access throughout the hotel.'),
(1, 'Swimming Pool', 'Outdoor swimming pool with a sun terrace.'),
(1, 'Gym', 'Fully equipped fitness center available 24/7.'),
(1, 'Spa', 'Relaxing spa services including massages and facials.'),
(2, 'Free Breakfast', 'Complimentary breakfast served daily.'),
(2, 'Parking', 'On-site parking available for guests.'),
(2, 'Business Center', 'Access to computers and printers for business needs.'),
(3, 'Pet Friendly', 'Pets are welcome with prior arrangement.'),
(3, 'Airport Shuttle', 'Free shuttle service to and from the airport.'),
(3, 'Restaurant', 'On-site dining with a variety of cuisines.'),
(4, 'Bar', 'Lounge bar serving a selection of drinks and snacks.'),
(4, 'Room Service', '24-hour room service available for all guests.'),
(5, 'Conference Rooms', 'Meeting rooms equipped with audio-visual technology.'),
(5, 'Laundry Service', 'Same-day laundry service available for guests.');


INSERT INTO customers (customer_id, first_name, last_name, email, phone, preferences) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', '555-1234', 'Late check-in'),
(2, 'Jane', 'Smith', 'jane.smith@example.com', '555-5678', 'High floor'),
(3, 'Alice', 'Johnson', 'alice.johnson@example.com', '555-8765', 'Pet-friendly'),
(4, 'Bob', 'Brown', 'bob.brown@example.com', '555-4321', 'Non-smoking room'),
(5, 'Charlie', 'Davis', 'charlie.davis@example.com', '555-1357', 'Accessible room'),
(6, 'Diana', 'Wilson', 'diana.wilson@example.com', '555-2468', 'Breakfast included'),
(7, 'Ethan', 'Martinez', 'ethan.martinez@example.com', '555-3698', 'Pool view'),
(8, 'Fiona', 'Garcia', 'fiona.garcia@example.com', '555-1472', 'Quiet room'),
(9, 'George', 'Lopez', 'george.lopez@example.com', '555-2589', 'Early check-out'),
(10, 'Hannah', 'Clark', 'hannah.clark@example.com', '555-3695', 'Late check-out');

INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, booking_date, status) VALUES
(1, 1, '2023-10-01', '2023-10-05', '2023-09-15', 'confirmed'),
(2, 2, '2023-10-10', '2023-10-15', '2023-09-20', 'confirmed'),
(3, 3, '2023-10-12', '2023-10-14', '2023-09-22', 'pending'),
(1, 4, '2023-11-01', '2023-11-03', '2023-09-25', 'confirmed'),
(4, 5, '2023-11-05', '2023-11-10', '2023-09-30', 'canceled'),
(2, 6, '2023-11-15', '2023-11-20', '2023-10-01', 'confirmed'),
(5, 7, '2023-12-01', '2023-12-05', '2023-10-05', 'confirmed'),
(3, 8, '2023-12-10', '2023-12-15', '2023-10-10', 'pending'),
(6, 9, '2023-12-20', '2023-12-25', '2023-10-15', 'confirmed'),
(4, 10, '2024-01-01', '2024-01-05', '2023-10-20', 'confirmed');
CREATE TABLE trip_stops (
                            id BIGSERIAL PRIMARY KEY,
                            trip_id BIGINT NOT NULL,
                            place_name VARCHAR(255) NOT NULL,
                            full_address VARCHAR(500),
                            custom_name VARCHAR(255),
                            description TEXT,
                            stop_order INTEGER NOT NULL,
                            latitude DECIMAL(10, 8),
                            longitude DECIMAL(11, 8),
                            added_by BIGINT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT fk_trip_stops_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
                            CONSTRAINT fk_trip_stops_added_by FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_trip_stops_trip ON trip_stops(trip_id);
CREATE INDEX idx_trip_stops_order ON trip_stops(trip_id, stop_order);
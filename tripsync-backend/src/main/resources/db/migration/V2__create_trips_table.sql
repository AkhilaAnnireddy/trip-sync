CREATE TABLE trips (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       description TEXT,
                       destination VARCHAR(255),
                       start_date DATE,
                       end_date DATE,
                       created_by BIGINT NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_trips_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE TABLE trip_participants (
                                   id BIGSERIAL PRIMARY KEY,
                                   trip_id BIGINT NOT NULL,
                                   user_id BIGINT NOT NULL,
                                   role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
                                   joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   CONSTRAINT fk_trip_participants_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
                                   CONSTRAINT fk_trip_participants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                   CONSTRAINT unique_trip_user UNIQUE (trip_id, user_id)
);

CREATE INDEX idx_trip_participants_trip ON trip_participants(trip_id);
CREATE INDEX idx_trip_participants_user ON trip_participants(user_id);
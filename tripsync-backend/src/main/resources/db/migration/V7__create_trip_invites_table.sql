CREATE TABLE trip_invites (
                              id BIGSERIAL PRIMARY KEY,
                              trip_id BIGINT NOT NULL,
                              invite_token VARCHAR(255) NOT NULL UNIQUE,
                              created_by BIGINT NOT NULL,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              expires_at TIMESTAMP,
                              is_used BOOLEAN DEFAULT FALSE,
                              CONSTRAINT fk_trip_invites_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
                              CONSTRAINT fk_trip_invites_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_trip_invites_token ON trip_invites(invite_token);
CREATE INDEX idx_trip_invites_trip ON trip_invites(trip_id);
CREATE TABLE trip_stop_votes (
                                 id BIGSERIAL PRIMARY KEY,
                                 trip_stop_id BIGINT NOT NULL,
                                 user_id BIGINT NOT NULL,
                                 vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('LIKE', 'DISLIKE')),
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 CONSTRAINT fk_trip_stop_votes_stop FOREIGN KEY (trip_stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
                                 CONSTRAINT fk_trip_stop_votes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                 CONSTRAINT unique_user_vote UNIQUE (trip_stop_id, user_id)
);

CREATE INDEX idx_trip_stop_votes_stop ON trip_stop_votes(trip_stop_id);
CREATE INDEX idx_trip_stop_votes_user ON trip_stop_votes(user_id);
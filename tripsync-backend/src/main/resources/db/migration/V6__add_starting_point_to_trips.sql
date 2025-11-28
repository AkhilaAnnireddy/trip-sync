ALTER TABLE trips ADD COLUMN starting_point VARCHAR(255);

CREATE INDEX idx_trips_starting_point ON trips(starting_point);
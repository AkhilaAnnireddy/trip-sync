ALTER TABLE trips
    ADD COLUMN start_latitude DECIMAL(10, 8),
ADD COLUMN start_longitude DECIMAL(11, 8),
ADD COLUMN destination_latitude DECIMAL(10, 8),
ADD COLUMN destination_longitude DECIMAL(11, 8);
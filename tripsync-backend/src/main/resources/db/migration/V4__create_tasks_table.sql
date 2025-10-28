CREATE TABLE tasks (
                       id BIGSERIAL PRIMARY KEY,
                       trip_id BIGINT NOT NULL,
                       title VARCHAR(255) NOT NULL,
                       description TEXT,
                       status VARCHAR(50) NOT NULL DEFAULT 'TODO',
                       assigned_to BIGINT,
                       due_date DATE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_tasks_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
                       CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_trip ON tasks(trip_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE TABLE expenses (
                          id BIGSERIAL PRIMARY KEY,
                          trip_id BIGINT NOT NULL,
                          amount DECIMAL(10, 2) NOT NULL,
                          currency VARCHAR(3) DEFAULT 'USD',
                          description VARCHAR(255) NOT NULL,
                          category VARCHAR(100),
                          paid_by BIGINT NOT NULL,
                          expense_date DATE NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
                          CONSTRAINT fk_expenses_paid_by FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
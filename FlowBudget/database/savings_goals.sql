-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_date DATE NOT NULL,
    auto_contribute BOOLEAN DEFAULT FALSE,
    contribution_amount DECIMAL(10,2),
    contribution_frequency ENUM('daily', 'weekly', 'monthly'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

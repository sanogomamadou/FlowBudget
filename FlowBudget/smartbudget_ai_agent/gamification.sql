CREATE TABLE IF NOT EXISTS flow_rank (
    user_id INT PRIMARY KEY,
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    streak_days INT DEFAULT 0,
    last_streak_update DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    xp_required INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_badges (
    user_id INT,
    badge_id INT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- Insert default badges
INSERT INTO badges (name, description, icon, xp_required) VALUES
('No-Stress', 'Finir le mois sans dépasser le budget', '😌', 100),
('Budget Ninja', 'Suivre 80% des SmartActions proposées', '🥷', 500),
('Money Surfer', 'Remonter d''un mois difficile', '🏄', 300),
('Streak King', '7 jours sans achat impulsif', '👑', 200),
('FlowMaster', ' Badge Ultime - Performance annuelle', '🔥', 5000)
ON DUPLICATE KEY UPDATE name=name;

-- ======================================================
-- Banco de Dados só para conseguir usar em outra máquina
-- ======================================================

CREATE DATABASE IF NOT EXISTS gup_db;
USE gup_db;

CREATE TABLE IF NOT EXISTS family_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    required_xp INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
)  ENGINE=INNODB;

INSERT INTO levels (required_xp) VALUES (100);

CREATE TABLE IF NOT EXISTS rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    amount INT NOT NULL,
    family_account_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (family_account_id)
        REFERENCES family_accounts (id) ON DELETE CASCADE
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    family_account_id INT NOT NULL,
    name VARCHAR(20) NOT NULL,
    profile_type ENUM('child', 'responsible') NOT NULL,
    notification_email VARCHAR(100) NULL,
    pin_hash VARCHAR(255) NULL,
    coins INT NOT NULL DEFAULT 0,
    xp INT NOT NULL DEFAULT 0,
    level_id INT NULL,
    goal_id INT NULL,
    strikes INT NOT NULL DEFAULT 0,
    role VARCHAR(20) NULL,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (family_account_id)
        REFERENCES family_accounts (id) ON DELETE CASCADE,
    FOREIGN KEY (level_id)
        REFERENCES levels (id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id)
        REFERENCES rewards (id) ON DELETE CASCADE,
	FOREIGN KEY (created_by)
		REFERENCES profiles (id) ON DELETE CASCADE
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    event_date DATE NOT NULL,
    family_account_id INT NOT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (family_Account_id)
        REFERENCES family_accounts (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by)
        REFERENCES profiles (id) ON DELETE CASCADE
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    deadline DATETIME NOT NULL,
    coins_reward INT NOT NULL DEFAULT 0,
    xp_reward INT NOT NULL DEFAULT 0,
    required_proof BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INT NOT NULL,
    family_account_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (created_by)
        REFERENCES profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (family_account_id)
        REFERENCES family_accounts (id) ON DELETE CASCADE
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS task_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    child_profile_id INT NOT NULL,
    status ENUM('pending', 'awaiting_approval', 'done', 'not_done') NOT NULL DEFAULT 'pending',
    submitted_at DATETIME NULL,
    completion_date DATETIME NULL,
    proof_photo VARCHAR(255) NULL,
    coins_earned INT NOT NULL DEFAULT 0,
    xp_earned INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (task_id , child_profile_id),
    FOREIGN KEY (task_id)
        REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (child_profile_id)
        REFERENCES profiles (id) ON DELETE CASCADE
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS coin_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    source VARCHAR(15) NOT NULL,
    amount_type VARCHAR(8) NOT NULL,
    amount INT NOT NULL,
    child_profile_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (child_profile_id)
        REFERENCES profiles (id) ON DELETE CASCADE
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    status ENUM('pending', 'done') NOT NULL DEFAULT 'pending',
    amount INT NOT NULL,
    child_profile_id INT NOT NULL,
    reward_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (child_profile_id)
        REFERENCES profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id)
        REFERENCES rewards (id) ON DELETE CASCADE
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS giraffe_colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    primary_color VARCHAR(20) NOT NULL,
    secondary_color VARCHAR(20) NOT NULL,
    required_level INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS giraffe_accessories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NULL,
    required_level INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS giraffe_backgrounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NULL,
    required_level INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS giraffes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_profile_id INT NOT NULL UNIQUE,
    color_id INT NOT NULL,
    accessory_id INT NULL,
    background_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (child_profile_id)
        REFERENCES profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (color_id)
        REFERENCES giraffe_colors (id) ON DELETE CASCADE,
    FOREIGN KEY (accessory_id)
        REFERENCES giraffe_accessories (id) ON DELETE CASCADE,
    FOREIGN KEY (background_id)
        REFERENCES giraffe_backgrounds (id) ON DELETE CASCADE
)  ENGINE=INNODB;

INSERT INTO giraffe_colors (primary_color, secondary_color, required_level) VALUES
    ('amarelo', 'marrom', 1),
    ('rosa', 'branco', 3),
    ('azul', 'prata', 5);

INSERT INTO giraffe_backgrounds (name, image_url, required_level) VALUES
    ('savana', '/static/giraffes/backgrounds/background1.png', 1),
    ('praia', '/static/giraffes/backgrounds/background2.png', 3),
    ('espaco', '/static/giraffes/backgrounds/background3.png', 5);

INSERT INTO giraffe_accessories (name, image_url, required_level) VALUES
    ('chapeu', '/static/giraffes/accessories/accessory1.png', 1),
    ('oculos', '/static/giraffes/accessories/accessory2.png', 3),
    ('coroa', '/static/giraffes/accessories/accessory3.png', 5);

IF NOT EXISTS CREATE TABLE notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    type ENUM('task_submitted', 'reward_redeemed', 'event_created') NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (profile_id, type),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

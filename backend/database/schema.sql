CREATE DATABASE IF NOT EXISTS gup_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE gup_db;


-- ---------------------------------------------------------------------
--  Regras de exclusão (ON DELETE) usadas neste schema
--
--  * family_account_id  -> CASCADE : apagar a conta família apaga TUDO dela.
--  * child_profile_id / profile_id / task_id -> CASCADE : apagar um perfil
--    ou uma tarefa leva junto o que pertence só a eles.
--  * created_by, goal_id, level_id, reward_id -> SET NULL : são só
--    "referências". Apagar uma recompensa, um nível ou quem criou algo NÃO
--    pode apagar a criança nem o histórico dela.
--  * itens da girafa em uso -> RESTRICT : o banco não deixa apagar uma cor
--    ou fundo que alguma girafa está usando.
-- ---------------------------------------------------------------------


-- ---------------------------------------------------------------------
--  Conta família (é quem faz login com e-mail + senha)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_accounts (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(30)  NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    birth_date    DATE         NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=INNODB;


-- ---------------------------------------------------------------------
--  Níveis
--  ATENÇÃO: mantenha id = level (1, 2, 3...). O código compara o id do
--  nível com required_level dos itens da girafa (giraffe_repository).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS levels (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    level       INT NOT NULL UNIQUE,
    xp_required INT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=INNODB;

-- Valores de XP são sugestão: ajuste como quiser (o nível 1 em 0 XP faz a
-- primeira tarefa aprovada já dar o nível 1).
INSERT IGNORE INTO levels (id, level, xp_required) VALUES
    (1, 1,   0),
    (2, 2, 100),
    (3, 3, 250),
    (4, 4, 500),
    (5, 5, 900);


-- ---------------------------------------------------------------------
--  Recompensas
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rewards (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(30) NOT NULL,
    amount            INT NOT NULL,
    family_account_id INT NOT NULL,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_rewards_amount CHECK (amount > 0),
    FOREIGN KEY (family_account_id)
        REFERENCES family_accounts (id) ON DELETE CASCADE
) ENGINE=INNODB;


-- ---------------------------------------------------------------------
--  Perfis (responsável / criança) dentro da conta família
--  coins, xp, level_id, seen_level, goal_id e strikes só fazem sentido
--  para perfil de criança. role = 'admin' ou NULL.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    family_account_id  INT NOT NULL,
    name               VARCHAR(20) NOT NULL,
    profile_type       ENUM('child', 'responsible') NOT NULL,
    role               VARCHAR(20) NULL,
    notification_email VARCHAR(100) NULL,
    pin_hash           VARCHAR(255) NULL,
    coins              INT NOT NULL DEFAULT 0,
    xp                 INT NOT NULL DEFAULT 0,
    level_id           INT NULL,
    seen_level         INT NOT NULL DEFAULT 0,
    goal_id            INT NULL,
    strikes            INT NOT NULL DEFAULT 0,
    created_by         INT NULL,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_profiles_coins   CHECK (coins >= 0),
    CONSTRAINT chk_profiles_xp      CHECK (xp >= 0),
    CONSTRAINT chk_profiles_strikes CHECK (strikes >= 0),
    FOREIGN KEY (family_account_id)
        REFERENCES family_accounts (id) ON DELETE CASCADE,
    FOREIGN KEY (level_id)
        REFERENCES levels (id) ON DELETE SET NULL,
    FOREIGN KEY (goal_id)
        REFERENCES rewards (id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)
        REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=INNODB;


-- ---------------------------------------------------------------------
--  Eventos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(30) NOT NULL,
    event_date        DATE NOT NULL,
    family_account_id INT NOT NULL,
    created_by        INT NULL,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (family_account_id)
        REFERENCES family_accounts (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by)
        REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=INNODB;


-- ---------------------------------------------------------------------
--  Tarefas e a atribuição de cada tarefa a uma criança
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    description       TEXT DEFAULT NULL,
    deadline          DATETIME NOT NULL,
    coins_reward      INT NOT NULL DEFAULT 0,
    xp_reward         INT NOT NULL DEFAULT 0,
    required_proof    BOOLEAN NOT NULL DEFAULT TRUE,
    created_by        INT NULL,
    family_account_id INT NOT NULL,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_tasks_coins CHECK (coins_reward >= 0),
    CONSTRAINT chk_tasks_xp    CHECK (xp_reward >= 0),
    FOREIGN KEY (created_by)
        REFERENCES profiles (id) ON DELETE SET NULL,
    FOREIGN KEY (family_account_id)
        REFERENCES family_accounts (id) ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS task_assignments (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    task_id          INT NOT NULL,
    child_profile_id INT NOT NULL,
    status           ENUM('pending', 'awaiting_approval', 'done', 'not_done') NOT NULL DEFAULT 'pending',
    submitted_at     DATETIME NULL,
    completion_date  DATETIME NULL,
    proof_photo      VARCHAR(255) NULL,
    coins_earned     INT NOT NULL DEFAULT 0,
    xp_earned        INT NOT NULL DEFAULT 0,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (task_id, child_profile_id),
    FOREIGN KEY (task_id)
        REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (child_profile_id)
        REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=INNODB;


-- ---------------------------------------------------------------------
--  Histórico de moedas
--  source:      task | redemption | manual_adjustment
--  amount_type: credit | debit   (amount é sempre positivo)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coin_history (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(50) NOT NULL,
    source           ENUM('task', 'redemption', 'manual_adjustment') NOT NULL,
    amount_type      ENUM('credit', 'debit') NOT NULL,
    amount           INT NOT NULL,
    child_profile_id INT NOT NULL,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_coin_history_amount CHECK (amount >= 0),
    FOREIGN KEY (child_profile_id)
        REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=INNODB;


-- ---------------------------------------------------------------------
--  Resgates (name e amount são uma "foto" da recompensa no momento da
--  compra; por isso o histórico sobrevive se a recompensa for apagada)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS redemptions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(30) NOT NULL,
    status           ENUM('pending', 'done') NOT NULL DEFAULT 'pending',
    amount           INT NOT NULL,
    child_profile_id INT NOT NULL,
    reward_id        INT NULL,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (child_profile_id)
        REFERENCES profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id)
        REFERENCES rewards (id) ON DELETE SET NULL
) ENGINE=INNODB;


-- ---------------------------------------------------------------------
--  Girafa: itens disponíveis
--  giraffe_colors tem DOIS jeitos de descrever a cor, porque o código
--  usa os dois hoje:
--     name / image_url                 -> GiraffeRepository (girafa e lista de itens)
--     primary_color / secondary_color  -> LevelRepository (itens desbloqueados)
--                                         e o giraffe.js antigo (mapa CORES)
--  Quando decidirem um só, apague o outro par de colunas.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS giraffe_colors (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    image_url       VARCHAR(255) NULL,
    primary_color   VARCHAR(20) NULL,
    secondary_color VARCHAR(20) NULL,
    required_level  INT NOT NULL DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS giraffe_backgrounds (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(50) NOT NULL,
    image_url      VARCHAR(255) NULL,
    required_level INT NOT NULL DEFAULT 1,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS giraffe_accessories (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(50) NOT NULL,
    image_url      VARCHAR(255) NULL,
    required_level INT NOT NULL DEFAULT 1,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=INNODB;

-- Girafa de cada criança (uma por criança)
CREATE TABLE IF NOT EXISTS giraffes (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    child_profile_id INT NOT NULL UNIQUE,
    color_id         INT NOT NULL,
    accessory_id     INT NULL,
    background_id    INT NOT NULL,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (child_profile_id)
        REFERENCES profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (color_id)
        REFERENCES giraffe_colors (id) ON DELETE RESTRICT,
    FOREIGN KEY (accessory_id)
        REFERENCES giraffe_accessories (id) ON DELETE SET NULL,
    FOREIGN KEY (background_id)
        REFERENCES giraffe_backgrounds (id) ON DELETE RESTRICT
) ENGINE=INNODB;


-- ---------------------------------------------------------------------
--  Itens da girafa (seeds)
--  O item de id 1 de cada tipo é o PADRÃO de toda criança nova
--  (DEFAULT_GIRAFFE_*_ID em create_profile_service.py): não apague nem
--  mude o id deles.
--
--  Arquivos que existem em backend/static/giraffes/:
--    backgrounds/background_1.png ... (existem os números 1-4, 7-23 e 25-30)
--    accessories/accessory_1.png ... accessory_5.png
--  Para adicionar itens, é só incluir mais linhas (ids novos).
-- ---------------------------------------------------------------------
insert into giraffe_colors (name, image_url, required_level) 
values ('amarelo', '/static/giraffes/colors/color_primary.png', 1);
insert into giraffe_colors (name, image_url, required_level) 
values ('azul', '/static/giraffes/colors/color_secondary.png', 3);

insert into giraffe_backgrounds (name, image_url, required_level)
values ("beach", "/static/giraffes/backgrounds/background_29.png", 1);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("jungle", "/static/giraffes/backgrounds/background_8.png", 1);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("night city", "/static/giraffes/backgrounds/background_9.png", 2);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("taiga", "/static/giraffes/backgrounds/background_10.png", 2);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("night beach", "/static/giraffes/backgrounds/background_2.png", 2);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("space", "/static/giraffes/backgrounds/background_15.png", 5);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("future city", "/static/giraffes/backgrounds/background_3.png", 4);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("snow", "/static/giraffes/backgrounds/background_4.png", 4);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("sky", "/static/giraffes/backgrounds/background_21.png", 3);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("sky", "/static/giraffes/backgrounds/background_30.png", 5);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("city", "/static/giraffes/backgrounds/background_11.png", 3);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("mountain", "/static/giraffes/backgrounds/background_16.png", 4);
insert into giraffe_backgrounds (name, image_url, required_level)
values ("beach", "/static/giraffes/backgrounds/background_29.png", 1);

insert into giraffe_accessories (name, image_url, required_level) 
values ('amarelo', '/static/giraffes/colors/color_primary.png', 1);
insert into giraffe_accessories (name, image_url, required_level) 
values ("glass", "/static/giraffes/accessories/accessory_3.png", 1);
insert into giraffe_accessories (name, image_url, required_level) 
values ("spider-man", "/static/giraffes/accessories/accessory_2.png", 3);
insert into giraffe_accessories (name, image_url, required_level) 
values ("mask", "/static/giraffes/accessories/accessory_5.png", 5);
insert into giraffe_accessories (name, image_url, required_level) 
values ("scarf", "/static/giraffes/accessories/accessory_4.png", 2);
insert into giraffe_accessories (name, image_url, required_level) 
values ('azul', '/static/giraffes/colors/color_secondary.png', 3);
insert into giraffe_accessories (name, image_url, required_level) 
values ('azul', '/static/giraffes/colors/color3.png', 5);
insert into giraffe_accessories (name, image_url, required_level) 
values ("super sayajin", "/static/giraffes/accessories/accessory_1.png", 5);


-- ---------------------------------------------------------------------
--  Preferências de notificação (por perfil)
--  Não adicione colunas aqui sem atualizar NotificationPreferenceModel:
--  ele recebe a linha inteira (**row) e só aceita id, profile_id, type, enabled.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_preferences (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    type       ENUM('task_submitted', 'reward_redeemed', 'event_created') NOT NULL,
    enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (profile_id, type),
    FOREIGN KEY (profile_id)
        REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=INNODB;
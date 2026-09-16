-- ======================================================
-- Banco de Dados só para conseguir usar em outra máquina
-- ======================================================

CREATE DATABASE IF NOT EXISTS gup_db;
USE gup_db;

CREATE TABLE IF NOT EXISTS contas_familia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL,
    pin VARCHAR(255) NOT NULL,
    email_dono VARCHAR(100) NOT NULL UNIQUE,

    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_nasc DATE NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'crianca',

    conta_id INT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (conta_id) REFERENCES contas_familia(id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS responsaveis (
    usuario_id INT PRIMARY KEY,
    cargo VARCHAR(20),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS niveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acessorio VARCHAR(20) NOT NULL DEFAULT 'Nenhum',
    xp_necessario INT NOT NULL,

    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
)ENGINE=InnoDB;

INSERT INTO niveis (id, acessorio, xp_necessario) VALUES (1, 'Nenhum', 0);

CREATE TABLE IF NOT EXISTS recompensas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL,
    custo_moedas INT NOT NULL,

    conta_id INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (conta_id) REFERENCES contas_familia(id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS criancas (
    usuario_id INT PRIMARY KEY,
    moedas INT NOT NULL DEFAULT 0,
    xp INT NOT NULL DEFAULT 0,
    strike INT NOT NULL DEFAULT 0,
    freezer INT NOT NULL DEFAULT 1,

    meta_id INT,
    nivel_id INT NOT NULL DEFAULT '1',
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (meta_id) REFERENCES recompensas(id),
    FOREIGN KEY (nivel_id) REFERENCES niveis(id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(30) NOT NULL,
    data DATE NOT NULL,

    usuario_id INT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pendente',
    horario_limite DATETIME NOT NULL,
    data_conclusao DATETIME DEFAULT NULL,
    moedas_ganha INT NOT NULL DEFAULT 0,
    xp_ganho INT NOT NULL DEFAULT 0,
    foto_comprovacao VARCHAR(255) DEFAULT NULL,
    
    crianca_id INT NOT NULL,
    responsavel_id INT NOT NULL,
    conta_id INT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (crianca_id) REFERENCES criancas(usuario_id),
    FOREIGN KEY (responsavel_id) REFERENCES responsaveis(usuario_id),
    FOREIGN KEY (conta_id) REFERENCES contas_familia(id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historico_moedas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    origem VARCHAR(15) NOT NULL,
    tipo_valor VARCHAR(8) NOT NULL,
    valor INT NOT NULL,

    crianca_id INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,       

    FOREIGN KEY (crianca_id) REFERENCES criancas(usuario_id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resgates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL,
    status ENUM('pendente', 'concluido', 'cancelado') NOT NULL DEFAULT 'pendente',
    custo INT NOT NULL,

    crianca_id INT NOT NULL,
    recompensa_id INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (crianca_id) REFERENCES criancas(usuario_id),
    FOREIGN KEY (recompensa_id) REFERENCES recompensas(id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,

    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    tarefa_id INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id),
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS girafas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cor_primaria VARCHAR(20) NOT NULL DEFAULT 'amarelo',
    cor_secundaria VARCHAR(20) NOT NULL DEFAULT 'marrom',

    crianca_id INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (crianca_id) REFERENCES criancas(usuario_id)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS solicitacoes_familia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    conta_id INT NOT NULL,
    status ENUM('pendente', 'aprovado', 'recusado') NOT NULL DEFAULT 'pendente',

    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (conta_id) REFERENCES contas_familia(id)
) ENGINE=InnoDB;

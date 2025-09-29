-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs (Azure AD ou local)
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    azure_oid     TEXT,               -- Object ID Azure (nullable)
    email         TEXT NOT NULL UNIQUE,
    display_name  TEXT,
    role          TEXT CHECK (role IN ('admin','dev','viewer')) DEFAULT 'viewer',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des scripts
CREATE TABLE scripts (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    content       TEXT NOT NULL,      -- script PowerShell complet
    creator_id    UUID REFERENCES users(id),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_modified_by UUID REFERENCES users(id),
    is_deleted    BOOLEAN DEFAULT false
);

-- Table des exécutions
CREATE TABLE executions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_id     UUID REFERENCES scripts(id),
    executor_id   UUID REFERENCES users(id),
    started_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    finished_at   TIMESTAMP WITH TIME ZONE,
    status        TEXT CHECK (status IN ('success','warning','error')),
    stdout        TEXT,
    stderr        TEXT,
    exit_code     INT
);

-- Index pour améliorer les performances
CREATE INDEX idx_scripts_creator_id ON scripts(creator_id);
CREATE INDEX idx_scripts_updated_at ON scripts(updated_at);
CREATE INDEX idx_executions_script_id ON executions(script_id);
CREATE INDEX idx_executions_executor_id ON executions(executor_id);
CREATE INDEX idx_executions_started_at ON executions(started_at);

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (email, display_name, role) 
VALUES ('admin@lumo.local', 'Administrator', 'admin');

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS urls (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), original_url text NOT NULL, short_code varchar(16) NOT NULL UNIQUE, is_active boolean NOT NULL DEFAULT true, expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS urls_short_code_idx ON urls(short_code); CREATE INDEX IF NOT EXISTS urls_expires_at_idx ON urls(expires_at);
CREATE TABLE IF NOT EXISTS url_clicks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), url_id uuid NOT NULL REFERENCES urls(id) ON DELETE CASCADE, clicked_at timestamptz NOT NULL DEFAULT now(), referrer text, user_agent text, country text);
CREATE INDEX IF NOT EXISTS url_clicks_url_id_idx ON url_clicks(url_id); CREATE INDEX IF NOT EXISTS url_clicks_clicked_at_idx ON url_clicks(clicked_at);

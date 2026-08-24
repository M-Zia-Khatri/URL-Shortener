CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url text NOT NULL,
  short_code varchar(16) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT urls_original_url_http_check CHECK (original_url ~* '^https?://'),
  CONSTRAINT urls_short_code_not_blank_check CHECK (length(trim(short_code)) > 0),
  CONSTRAINT urls_updated_after_created_check CHECK (updated_at >= created_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS urls_short_code_unique ON urls(short_code);
CREATE INDEX IF NOT EXISTS urls_expires_at_idx ON urls(expires_at);

CREATE TABLE IF NOT EXISTS url_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id uuid NOT NULL,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  referrer text,
  user_agent text,
  country text,
  CONSTRAINT url_clicks_url_id_fk FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS url_clicks_url_id_idx ON url_clicks(url_id);
CREATE INDEX IF NOT EXISTS url_clicks_clicked_at_idx ON url_clicks(clicked_at);

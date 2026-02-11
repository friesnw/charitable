-- Up Migration
CREATE TABLE magic_link_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast token lookup
CREATE INDEX idx_magic_link_tokens_token ON magic_link_tokens(token);

-- Index for cleanup of expired tokens
CREATE INDEX idx_magic_link_tokens_expires ON magic_link_tokens(expires_at);

---- Down Migration
DROP TABLE magic_link_tokens;

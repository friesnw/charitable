ALTER TABLE users ADD COLUMN share_token UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX idx_users_share_token ON users(share_token);

---- Down Migration
ALTER TABLE users DROP COLUMN share_token;

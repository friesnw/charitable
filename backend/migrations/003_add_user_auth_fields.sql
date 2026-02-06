  -- Up Migration
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;

  ---- Down Migration
ALTER TABLE users DROP COLUMN last_login;
ALTER TABLE users DROP COLUMN email_verified;
ALTER TABLE users DROP COLUMN password_hash;
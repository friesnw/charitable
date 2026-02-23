-- Add photo to charity locations (logo_url already exists on charities from migration 002)
ALTER TABLE charity_locations ADD COLUMN photo_url VARCHAR(500);

-- Add admin flag to users
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

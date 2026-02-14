-- Up Migration

-- 1. Add new columns to charities
ALTER TABLE charities ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE charities ADD COLUMN founded_year INTEGER;
ALTER TABLE charities ADD COLUMN volunteer_url VARCHAR(500);
ALTER TABLE charities ADD COLUMN every_org_claimed BOOLEAN DEFAULT FALSE;
ALTER TABLE charities ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE charities ADD COLUMN primary_address TEXT;

-- 2. Create charity_locations table
CREATE TABLE charity_locations (
  id SERIAL PRIMARY KEY,
  charity_id INTEGER REFERENCES charities(id) ON DELETE CASCADE NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add indexes
CREATE INDEX idx_charities_slug ON charities(slug);
CREATE INDEX idx_charities_ein ON charities(ein);
CREATE INDEX idx_charities_every_org_slug ON charities(every_org_slug);
CREATE INDEX idx_charity_locations_charity ON charity_locations(charity_id);
CREATE INDEX idx_donation_intents_charge_id ON donation_intents(charge_id);

---- Down Migration
DROP INDEX IF EXISTS idx_donation_intents_charge_id;
DROP INDEX IF EXISTS idx_charity_locations_charity;
DROP INDEX IF EXISTS idx_charities_every_org_slug;
DROP INDEX IF EXISTS idx_charities_ein;
DROP INDEX IF EXISTS idx_charities_slug;
DROP TABLE IF EXISTS charity_locations;
ALTER TABLE charities DROP COLUMN primary_address;
ALTER TABLE charities DROP COLUMN is_active;
ALTER TABLE charities DROP COLUMN every_org_claimed;
ALTER TABLE charities DROP COLUMN volunteer_url;
ALTER TABLE charities DROP COLUMN founded_year;
ALTER TABLE charities DROP COLUMN slug;

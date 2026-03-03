-- Up Migration
ALTER TABLE donation_intents ADD COLUMN donor_email VARCHAR(255);

CREATE INDEX idx_donation_intents_donor_email ON donation_intents(donor_email);

---- Down Migration
DROP INDEX IF EXISTS idx_donation_intents_donor_email;
ALTER TABLE donation_intents DROP COLUMN donor_email;

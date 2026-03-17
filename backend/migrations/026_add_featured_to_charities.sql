-- Up Migration

ALTER TABLE charities ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE charities SET featured = TRUE WHERE slug IN (
  'denver-rescue-mission',
  'warren-village',
  'urban-peak'
);

-- Down Migration
-- ALTER TABLE charities DROP COLUMN IF EXISTS featured;

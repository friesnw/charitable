-- Up Migration
ALTER TABLE user_preferences
  ADD COLUMN zip_code     VARCHAR(10),
  ADD COLUMN neighborhood VARCHAR(100);

---- Down Migration
ALTER TABLE user_preferences
  DROP COLUMN IF EXISTS zip_code,
  DROP COLUMN IF EXISTS neighborhood;

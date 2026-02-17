-- Up Migration
ALTER TABLE charity_locations ADD COLUMN latitude DECIMAL(10, 7);
ALTER TABLE charity_locations ADD COLUMN longitude DECIMAL(10, 7);

---- Down Migration
ALTER TABLE charity_locations DROP COLUMN longitude;
ALTER TABLE charity_locations DROP COLUMN latitude;

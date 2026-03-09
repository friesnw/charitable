-- Up Migration
ALTER TABLE charities ADD COLUMN donate_url VARCHAR(500);

---- Down Migration
ALTER TABLE charities DROP COLUMN donate_url;

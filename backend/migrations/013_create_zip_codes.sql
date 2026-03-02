-- Up Migration
CREATE TABLE zip_codes (
  zip       VARCHAR(10) PRIMARY KEY,
  city      VARCHAR(100) NOT NULL,
  state     VARCHAR(2)   NOT NULL,
  latitude  DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL
);

CREATE INDEX idx_zip_codes_zip ON zip_codes (zip);

---- Down Migration
DROP TABLE IF EXISTS zip_codes;

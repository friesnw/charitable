-- Up Migration                                                                     
CREATE TABLE charities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  cause_tags TEXT[] DEFAULT '{}',
  every_org_slug VARCHAR(255) UNIQUE,
  ein VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE INDEX idx_charities_cause_tags ON charities USING GIN(cause_tags);
                          

  ---- Down Migration
DROP INDEX IF EXISTS idx_charities_cause_tags;
DROP TABLE charities;
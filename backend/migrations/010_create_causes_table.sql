-- Up Migration
CREATE TABLE causes (
  tag VARCHAR(100) PRIMARY KEY,
  label VARCHAR(255) NOT NULL
);

INSERT INTO causes (tag, label) VALUES
  ('adoption', 'Adoption'),
  ('animals', 'Animals'),
  ('arts', 'Arts'),
  ('community', 'Community'),
  ('education', 'Education'),
  ('environment', 'Environment'),
  ('families', 'Families'),
  ('food-security', 'Food Security'),
  ('health', 'Health'),
  ('homelessness', 'Homelessness'),
  ('housing', 'Housing'),
  ('hunger', 'Hunger'),
  ('mental-health', 'Mental Health'),
  ('mentorship', 'Mentorship'),
  ('pets', 'Pets'),
  ('seniors', 'Seniors'),
  ('youth', 'Youth');

---- Down Migration
DROP TABLE IF EXISTS causes;

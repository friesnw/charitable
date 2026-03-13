-- Up Migration
-- Consolidates 19 cause tags down to 11, removes redundant/low-signal tags,
-- and updates charity cause_tags arrays to match.

-- Step 1: Update charity cause_tags before removing causes

-- Denver Rescue Mission: homelessness+housing → housing, drop christian
UPDATE charities
SET cause_tags = ARRAY['housing', 'hunger']
WHERE slug = 'denver-rescue-mission';

-- Food Bank of the Rockies: drop food-security (redundant with hunger)
UPDATE charities
SET cause_tags = ARRAY['hunger', 'families']
WHERE slug = 'food-bank-of-the-rockies';

-- Humane Colorado: pets+adoption absorbed into animals
UPDATE charities
SET cause_tags = ARRAY['animals']
WHERE slug = 'humane-colorado';

-- Warren Village: homelessness absorbed into housing, drop women
UPDATE charities
SET cause_tags = ARRAY['housing', 'youth', 'families']
WHERE slug = 'warren-village';

-- Step 2: Remove consolidated/dropped cause tags
DELETE FROM causes WHERE tag IN (
  'adoption',
  'christian',
  'community',
  'food-security',
  'homelessness',
  'mentorship',
  'pets',
  'women'
);

-- Step 3: Rename Health → Healthcare
UPDATE causes SET label = 'Healthcare' WHERE tag = 'health';

---- Down Migration
-- Note: full restoration requires re-running migration 011
DELETE FROM causes WHERE tag IN (
  'animals', 'arts', 'education', 'environment', 'families',
  'health', 'housing', 'hunger', 'mental-health', 'seniors', 'youth'
);

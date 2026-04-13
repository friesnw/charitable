-- Up Migration
DELETE FROM causes WHERE tag = 'disaster-resilience';

---- Down Migration
INSERT INTO causes (tag, label) VALUES ('disaster-resilience', 'Disaster Resilience') ON CONFLICT DO NOTHING;

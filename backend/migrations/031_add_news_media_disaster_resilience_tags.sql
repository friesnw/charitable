-- Up Migration
INSERT INTO causes (tag, label) VALUES
  ('news-media', 'News & Media'),
  ('disaster-resilience', 'Disaster Resilience')
ON CONFLICT DO NOTHING;

---- Down Migration
DELETE FROM causes WHERE tag IN ('news-media', 'disaster-resilience');

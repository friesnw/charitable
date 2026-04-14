ALTER TABLE analytics_events
  ADD COLUMN device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop'));

CREATE INDEX ON analytics_events (device_type);

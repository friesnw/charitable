CREATE TABLE analytics_events (
  id           SERIAL PRIMARY KEY,
  event_name   TEXT NOT NULL,
  event_data   JSONB,
  page_url     TEXT,
  referrer     TEXT,
  user_agent   TEXT,
  session_id   TEXT,
  user_id      INTEGER REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON analytics_events (event_name);
CREATE INDEX ON analytics_events (created_at);
CREATE INDEX ON analytics_events (session_id);

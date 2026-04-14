CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id INTEGER NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, charity_id)
);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_charity_id ON user_favorites(charity_id);

---- Down Migration
DROP TABLE IF EXISTS user_favorites;

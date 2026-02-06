  -- Up Migration                                                             
CREATE TABLE donation_intents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    charity_id INTEGER REFERENCES charities(id) NOT NULL,
    charge_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('one-time', 'monthly')),
    is_initial BOOLEAN DEFAULT TRUE,  
    donation_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE INDEX idx_donation_intents_user ON donation_intents(user_id);
CREATE INDEX idx_donation_intents_charity ON donation_intents(charity_id);
                                                                                   
                                                                                      
  ---- Down Migration   
DROP INDEX IF EXISTS idx_donation_intents_charity;
DROP INDEX IF EXISTS idx_donation_intents_user;
DROP TABLE donation_intents;
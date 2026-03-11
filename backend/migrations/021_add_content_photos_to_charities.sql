ALTER TABLE charities ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
ALTER TABLE charities ADD COLUMN IF NOT EXISTS content_photo_url_1 TEXT;
ALTER TABLE charities ADD COLUMN IF NOT EXISTS content_photo_url_2 TEXT;
ALTER TABLE charities ADD COLUMN IF NOT EXISTS program_highlights TEXT;
ALTER TABLE charities ADD COLUMN IF NOT EXISTS usage_credit TEXT;

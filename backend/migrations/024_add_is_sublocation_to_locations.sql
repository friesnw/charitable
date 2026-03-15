-- Marks a location as operating within another org's space (tenant/sublocation).
-- Defaults false so all existing locations are treated as primary.
-- Only set to true for co-located entries like "Early Learning Center at Warren Village".
ALTER TABLE charity_locations ADD COLUMN IF NOT EXISTS is_sublocation BOOLEAN NOT NULL DEFAULT FALSE;

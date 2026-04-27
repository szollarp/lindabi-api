-- Cleans up partial state from a failed run of
-- 2025012800000000-create-tender-items-search.js so the migration can be retried.
--
-- Symptom: ERROR: relation "idx_tender_items_search_tenant_active" already exists
-- Cause:   prior run created the table and some indexes, but crashed before
--          SequelizeMeta recorded the migration -> rerun collides with itself.
--
-- Safety guard: only drops if SequelizeMeta does NOT contain the migration row.
-- Run as the migration DB user.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "SequelizeMeta"
    WHERE name = '2025012800000000-create-tender-items-search.js'
  ) THEN
    DROP INDEX IF EXISTS idx_tender_items_search_tenant_active;
    DROP INDEX IF EXISTS idx_tender_items_search_usage;
    DROP INDEX IF EXISTS idx_tender_items_search_normalized_name_trgm;
    DROP INDEX IF EXISTS idx_tender_items_search_alias_names_gin;
    DROP INDEX IF EXISTS idx_tender_items_search_tags_gin;
    DROP TABLE IF EXISTS tender_items_search CASCADE;
  ELSE
    RAISE NOTICE 'Migration already recorded in SequelizeMeta; nothing to clean up.';
  END IF;
END $$;

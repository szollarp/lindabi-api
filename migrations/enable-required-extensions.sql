-- Enables all PostgreSQL extensions required by the Sequelize migrations in api/migrations/.
--
-- pg_trgm  -> trigram-based fuzzy text search; used by gin_trgm_ops indexes on
--             tender_items_search.normalized_name, users.name, companies.name,
--             contacts.name, locations.name, items.name, projects.name,
--             tender_items.name (see 2025012800000002, 2025012800000000, 2025012800000003).
-- unaccent -> diacritic-insensitive normalization; used by the normalize_search_text()
--             PL/pgSQL function (see 2025012800000001-add-tender-items-search-triggers.js).
--
-- Run as a superuser (or a role with CREATE on the database) before the migrations.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create a function to normalize text (similar to the one in the service)
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION normalize_search_text(input_text TEXT)
      RETURNS TEXT AS $$
      BEGIN
        RETURN lower(
          unaccent(
            regexp_replace(
              regexp_replace(input_text, '\\s+', ' ', 'g'),
              '^\\s+|\\s+$', '', 'g'
            )
          )
        );
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create a function to sync tender item to search table
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION sync_tender_item_to_search()
      RETURNS TRIGGER AS $$
      DECLARE
        search_record RECORD;
        normalized_name TEXT;
        tender_tenant_id INTEGER;
        tender_currency VARCHAR(3);
        default_price_net DECIMAL(10,2);
      BEGIN
        -- Get tender information
        SELECT tenant_id, currency INTO tender_tenant_id, tender_currency
        FROM tenders 
        WHERE id = NEW.tender_id;

        -- Skip if tender doesn't exist or has no tenant
        IF tender_tenant_id IS NULL THEN
          RETURN NEW;
        END IF;

        -- Normalize the tender item name
        normalized_name := normalize_search_text(COALESCE(NEW.name, ''));
        
        -- Calculate default price (material + fee unit amounts)
        default_price_net := COALESCE(NEW.material_net_unit_amount, 0) + COALESCE(NEW.fee_net_unit_amount, 0);

        -- Check if search record exists
        SELECT * INTO search_record 
        FROM tender_items_search 
        WHERE tender_item_id = NEW.id;

        IF search_record IS NOT NULL THEN
          -- Update existing record
          UPDATE tender_items_search SET
            tenant_id = tender_tenant_id,
            active = true,
            name = NEW.name,
            normalized_name = normalized_name,
            unit = NEW.unit,
            default_price_net = default_price_net,
            currency = COALESCE(tender_currency, 'HUF'),
            vat_rate = NULL,
            tags = ARRAY[]::TEXT[],
            updated_at = CURRENT_TIMESTAMP
          WHERE tender_item_id = NEW.id;
        ELSE
          -- Insert new record
          INSERT INTO tender_items_search (
            tender_item_id, tenant_id, active, name, normalized_name, 
            unit, default_price_net, currency, vat_rate, 
            usage_count, last_used_at, alias_names, tags,
            created_at, updated_at
          ) VALUES (
            NEW.id, tender_tenant_id, true, NEW.name, normalized_name,
            NEW.unit, default_price_net, COALESCE(tender_currency, 'HUF'), NULL,
            0, NULL, ARRAY[]::TEXT[], ARRAY[]::TEXT[],
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          );
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create a function to remove tender item from search table
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION remove_tender_item_from_search()
      RETURNS TRIGGER AS $$
      BEGIN
        DELETE FROM tender_items_search WHERE tender_item_id = OLD.id;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create triggers
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trigger_sync_tender_item_to_search_insert
      AFTER INSERT ON tender_items
      FOR EACH ROW
      EXECUTE FUNCTION sync_tender_item_to_search();
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trigger_sync_tender_item_to_search_update
      AFTER UPDATE ON tender_items
      FOR EACH ROW
      EXECUTE FUNCTION sync_tender_item_to_search();
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trigger_remove_tender_item_from_search
      AFTER DELETE ON tender_items
      FOR EACH ROW
      EXECUTE FUNCTION remove_tender_item_from_search();
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop triggers
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_sync_tender_item_to_search_insert ON tender_items;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_sync_tender_item_to_search_update ON tender_items;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_remove_tender_item_from_search ON tender_items;
    `);

    // Drop functions
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS sync_tender_item_to_search();
    `);

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS remove_tender_item_from_search();
    `);

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS normalize_search_text(TEXT);
    `);
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tender_number_counters', {
      tenant_id: { type: Sequelize.INTEGER, allowNull: false },
      contractor_id: { type: Sequelize.INTEGER, allowNull: false },
      year: { type: Sequelize.INTEGER, allowNull: false },
      seq: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE tender_number_counters
      ADD CONSTRAINT tender_number_counters_pk
      PRIMARY KEY (tenant_id, contractor_id, year);
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO tender_number_counters (tenant_id, contractor_id, year, seq)
      SELECT
        tenant_id,
        contractor_id,
        (substring("number" from '([0-9]{4})-[0-9]+$'))::int AS year,
        MAX((substring("number" from '([0-9]+)$'))::int)     AS seq
      FROM "tenders"
      WHERE "number" IS NOT NULL AND "number" <> ''
        AND contractor_id IS NOT NULL
        AND "number" ~ '^[^-]+-[0-9]{4}-[0-9]+$'
      GROUP BY tenant_id, contractor_id,
        (substring("number" from '([0-9]{4})-[0-9]+$'))::int
      ON CONFLICT (tenant_id, contractor_id, year)
      DO UPDATE SET seq = GREATEST(tender_number_counters.seq, EXCLUDED.seq);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tender_number_counters');
  },
};
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, clean up any existing duplicate tender numbers
    await queryInterface.sequelize.query(`
      WITH duplicates AS (
        SELECT 
          id,
          number,
          ROW_NUMBER() OVER (PARTITION BY tenant_id, number ORDER BY created_on) as rn
        FROM tenders 
        WHERE number IS NOT NULL AND number != ''
      )
      UPDATE tenders 
      SET number = number || '-dup-' || id
      FROM duplicates 
      WHERE tenders.id = duplicates.id 
        AND duplicates.rn > 1;
    `);

    // Add unique constraint on tenant_id and number combination
    await queryInterface.addConstraint('tenders', {
      fields: ['tenant_id', 'number'],
      type: 'unique',
      name: 'tenders_tenant_id_number_unique',
      where: {
        number: {
          [Sequelize.Op.ne]: null
        }
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('tenders', 'tenders_tenant_id_number_unique');
  },
};

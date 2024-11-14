"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      return await Promise.all([
        queryInterface.removeColumn("tender_items", "material_actual_net_amount", { transaction: t }),
        queryInterface.removeColumn("tender_items", "fee_actual_net_amount", { transaction: t }),
        queryInterface.removeColumn("tender_items", "total_material_amount", { transaction: t }),
        queryInterface.removeColumn("tender_items", "total_fee_amount", { transaction: t })
      ])
    });
  },
  down: (queryInterface) => { }
};
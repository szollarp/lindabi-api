const { initDB } = require('./src/models');
const { Sequelize } = require('sequelize');

async function run() {
  // We don't actually need to connect, just want to see the SQL it would generate.
  // Actually, we can just require models.
  const models = require('./src/models').default;
  
  // Try to build a project supervisor and see its dataValues:
  const instance = models.ProjectSupervisor.build({ projectId: 9, userId: 47, startDate: new Date() });
  console.log("dataValues:", instance.dataValues);
  console.log("attributes:", Object.keys(models.ProjectSupervisor.getAttributes()));
}
run().catch(console.error);

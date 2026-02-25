const { initDB } = require('./src/models');
const { Sequelize, Op } = require('sequelize');

async function test() {
  const models = require('./src/models').default;
  const sequelize = models.sequelize;

  // Find a specific project and see its supervisors
  const projectId = 9; // use the one from the logs
  const supervisors = await models.ProjectSupervisor.findAll({ 
    where: { projectId },
    raw: true 
  });
  console.log("Current supervisors:", supervisors);

  // Replicate the target for reactivation update
  const previousSupervisor = await models.ProjectSupervisor.findOne({
    where: { projectId, endDate: { [Op.not]: null } },
    order: [['endDate', 'DESC']]
  });
  
  if (previousSupervisor) {
    console.log("Found previous:", previousSupervisor.get({ plain: true }));
    
    // Test the update syntax generating SQL:
    await models.ProjectSupervisor.update({ endDate: null }, {
      where: { 
        projectId: previousSupervisor.projectId,
        userId: previousSupervisor.userId,
        // using the ISO string might fix timezone issues with Date objects
        startDate: previousSupervisor.startDate 
      }
    });
    
    const check = await models.ProjectSupervisor.findOne({
      where: { 
        projectId: previousSupervisor.projectId,
        userId: previousSupervisor.userId,
        startDate: previousSupervisor.startDate 
      },
      raw: true
    });
    console.log("After update:", check);
  } else {
    console.log("No previous supervisor found to reactivate.");
  }
}
test().catch(console.error).finally(() => process.exit(0));

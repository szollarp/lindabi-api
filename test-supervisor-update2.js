const { Sequelize, DataTypes, Op } = require('sequelize');

async function test() {
  const sequelize = new Sequelize(process.env.DB_DATABASE || 'lindabi', process.env.DB_USER || 'lindabi', process.env.DB_PASSWORD || 'lindabi', {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: console.log, // Enable SQL query logging
  });

  const ProjectSupervisorModel = sequelize.define('ProjectSupervisor', {
    projectId: { type: DataTypes.INTEGER, allowNull: false, field: 'project_id', primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id', primaryKey: true },
    startDate: { type: DataTypes.DATE, allowNull: true, field: 'start_date', primaryKey: true },
    endDate: { type: DataTypes.DATE, allowNull: true, field: 'end_date' },
  }, {
    tableName: 'project_supervisors',
    timestamps: false
  });

  const projectId = 9;

  try {
    const list = await ProjectSupervisorModel.findAll({ where: { projectId }, raw: true });
    console.log("\nALL RECORDS:", list);
    
    const previous = await ProjectSupervisorModel.findOne({
      where: { projectId, endDate: { [Op.not]: null } },
      order: [['endDate', 'DESC']],
      raw: true
    });

    if (previous) {
      console.log("\nFOUND PREVIOUS:", previous);
      
      const updated = await ProjectSupervisorModel.update({ endDate: null }, {
        where: { 
          projectId: previous.projectId,
          userId: previous.userId,
          startDate: previous.startDate 
        }
      });
      console.log("\nUPDATE RESULT:", updated);
    }
  } catch(e) { console.error(e); }
}

require('dotenv').config();
test().finally(() => process.exit(0));

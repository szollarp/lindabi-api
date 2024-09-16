"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("permissions", [{
      name: 'Project:Create',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:List',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:GetMain',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:GetAmount',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:GetMilestones',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:GetDescriptions',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:GetItems',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:GetDocuments',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:GetNotes',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:GetJournal',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:UpdateMain',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:UpdateDescriptions',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:UpdateMilestones',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:UpdateSupervisorPremium',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:UpdateEmployeeSchedule',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:UpdateDocuments',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:UpdateNotes',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:SeeNotes',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:Delete',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:DeleteMilestone',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:DeleteItem',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:DeleteDocument',
      created_on: new Date(),
      updated_on: new Date()
    }, {
      name: 'Project:DeleteNote',
      created_on: new Date(),
      updated_on: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("permissions", null, {});
  }
};
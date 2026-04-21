module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("users", "expo_push_token", {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn("users", "expo_push_token");
    }
};

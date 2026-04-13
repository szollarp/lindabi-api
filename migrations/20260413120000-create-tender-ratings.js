module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("tender_ratings", {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            tender_id: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: "tenders",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            tenant_id: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "tenants",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            token: {
                type: Sequelize.DataTypes.STRING(36),
                allowNull: false,
                unique: true
            },
            quality: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            accuracy: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            tidiness: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            flexibility: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            attitude: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            feedback: {
                type: Sequelize.DataTypes.TEXT,
                allowNull: true,
                defaultValue: null
            },
            submitted_at: {
                type: Sequelize.DataTypes.DATE,
                allowNull: true,
                defaultValue: null
            },
            sent_at: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false
            },
            created_on: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false
            },
            updated_on: {
                type: Sequelize.DataTypes.DATE,
                allowNull: true,
                defaultValue: null
            }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("tender_ratings");
    }
};

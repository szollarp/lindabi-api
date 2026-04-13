import { Model, DataTypes } from "sequelize";
import type {
    Sequelize, Association, NonAttribute, ForeignKey
} from "sequelize";
import type { TenderRating, CreateTenderRatingProperties } from "./interfaces/tender-rating";
import type { Tender } from "./interfaces/tender";
import type { Tenant } from "./interfaces/tenant";
import type { TenderModel } from "./tender";
import type { TenantModel } from "./tenant";
import type { Models } from ".";

export class TenderRatingModel extends Model<TenderRating, CreateTenderRatingProperties> implements TenderRating {
    public id!: number;

    public token!: string;

    public quality!: number | null;

    public accuracy!: number | null;

    public tidiness!: number | null;

    public flexibility!: number | null;

    public attitude!: number | null;

    public feedback!: string | null;

    public submittedAt!: Date | null;

    public sentAt!: Date;

    public readonly createdOn!: Date;

    public readonly updatedOn!: Date | null;

    declare tenderId: ForeignKey<Tender["id"]>;

    declare tenantId: ForeignKey<Tenant["id"]>;

    declare tender?: NonAttribute<Tender>;

    declare tenant?: NonAttribute<Tenant>;

    public static associate: (models: Models) => void;

    public static associations: {
        tender: Association<TenderRatingModel, TenderModel>
        tenant: Association<TenderRatingModel, TenantModel>
    };
}

export const TenderRatingFactory = (sequelize: Sequelize): typeof TenderRatingModel => {
    TenderRatingModel.init(
        {
            id: {
                unique: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
                autoIncrement: true
            },
            tenderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true
            },
            tenantId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            token: {
                type: DataTypes.STRING(36),
                allowNull: false,
                unique: true
            },
            quality: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            accuracy: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            tidiness: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            flexibility: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            attitude: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            feedback: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null
            },
            submittedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null
            },
            sentAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            createdOn: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedOn: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null
            }
        },
        {
            sequelize,
            tableName: "tender_ratings",
            timestamps: true,
            createdAt: "createdOn",
            updatedAt: "updatedOn",
            underscored: true
        }
    );

    TenderRatingModel.associate = (models) => {
        TenderRatingModel.belongsTo(models.Tender, {
            foreignKey: "tender_id",
            as: "tender"
        });
        TenderRatingModel.belongsTo(models.Tenant, {
            foreignKey: "tenant_id",
            as: "tenant"
        });
    };

    return TenderRatingModel;
};

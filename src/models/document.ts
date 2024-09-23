import { Model, DataTypes, type Sequelize } from "sequelize";
import { CreateDocumentProperties, Document, DocumentOwnerType, DocumentType } from "./interfaces/document";
import type { Models } from ".";

export class DocumentModel extends Model<Document, CreateDocumentProperties> implements Document {
  public id!: number;

  public name?: string | null;

  public size?: number | null;

  public preview?: string | null;

  public type!: DocumentType;

  public data!: string;

  public mimeType!: string;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public ownerId?: number | null;

  public ownerType?: DocumentOwnerType;

  public properties?: Record<string, unknown> | {};

  public companyId?: number | string | null;

  public approved?: boolean;

  public static associate: (models: Models) => void;
}

export const DocumentFactory = (sequelize: Sequelize): typeof DocumentModel => {
  DocumentModel.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      preview: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      data: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
        get() {
          const data = this.getDataValue("data");
          return data !== null ? Buffer.from(data).toString() : null;
        }
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ownerType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      createdOn: {
        type: DataTypes.DATE
      },
      updatedOn: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      },
      properties: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      approved: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      }
    },
    {
      sequelize,
      tableName: "documents",
      timestamps: true,
      createdAt: "created_on",
      updatedAt: "updated_on",
      paranoid: false,
      underscored: true
    }
  );

  DocumentModel.associate = (models) => {
    DocumentModel.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "user",
      scope: {
        ownerType: "user"
      }
    });

    DocumentModel.belongsTo(models.Tenant, {
      foreignKey: "owner_id",
      as: "tenant",
      scope: {
        ownerType: "tenant"
      }
    });

    DocumentModel.belongsTo(models.Company, {
      foreignKey: "owner_id",
      as: "company",
      scope: {
        ownerType: "company"
      }
    });

    DocumentModel.belongsTo(models.Tender, {
      foreignKey: "owner_id",
      as: "tender",
      scope: {
        ownerType: "tender"
      }
    });

    DocumentModel.belongsTo(models.Project, {
      foreignKey: "owner_id",
      as: "project",
      scope: {
        ownerType: "project"
      }
    });

    DocumentModel.belongsTo(models.Milestone, {
      foreignKey: "owner_id",
      as: "milestone",
      scope: {
        ownerType: "milestone"
      }
    });
  };

  return DocumentModel;
};

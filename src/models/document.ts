import { Model, DataTypes, type Sequelize } from "sequelize";
import { CreateDocumentProperties, Document, DocumentOwnerType, DocumentType } from "./interfaces/document";
import { AzureStorageService } from "../helpers/azure-storage";
import { isImage } from "../helpers/document";
import type { Models } from ".";

export class DocumentModel extends Model<Document, CreateDocumentProperties> implements Document {
  public id!: number;

  public name?: string | null;

  public type!: DocumentType;

  public mimeType!: string;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public ownerId?: number | null;

  public ownerType?: DocumentOwnerType;

  public properties?: Record<string, unknown> | {};

  public companyId?: number | string | null;

  public approved?: boolean;

  public readonly stored!: {
    original: string;
    resized?: string;
    thumbnail?: string;
  };

  public static associate: (models: Models) => void;
}

export const DocumentFactory = (sequelize: Sequelize, storage: AzureStorageService): typeof DocumentModel => {
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
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true
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
      },
      stored: {
        type: DataTypes.VIRTUAL,
        get() {
          try {
            const original = storage.generateSasUrl(this.name!);

            if (!isImage(this.mimeType)) {
              return { original };
            }

            const resized = storage.generateSasUrl(`resized/${this.name!}`);
            const thumbnail = storage.generateSasUrl(`thumbnail/${this.name!}`);

            return { original, resized, thumbnail };
          } catch (e) {
            return {};
          }
        },
      },
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

    DocumentModel.belongsTo(models.StatusReport, {
      foreignKey: "owner_id",
      as: "report",
      scope: {
        ownerType: "report"
      }
    });

    DocumentModel.belongsTo(models.Execution, {
      foreignKey: "owner_id",
      as: "execution",
      scope: {
        ownerType: "execution"
      }
    });

    DocumentModel.belongsTo(models.Invoice, {
      foreignKey: "owner_id",
      as: "invoice",
      scope: {
        ownerType: "invoice"
      }
    });

    DocumentModel.belongsTo(models.Task, {
      foreignKey: "owner_id",
      as: "task",
      scope: {
        ownerType: "task"
      }
    });
  };

  return DocumentModel;
};

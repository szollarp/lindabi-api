import { Model, DataTypes } from "sequelize";
import type {
  Association, ForeignKey, HasManyAddAssociationMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin, HasOneGetAssociationMixin, HasOneSetAssociationMixin, NonAttribute, Sequelize
} from "sequelize";
import { PROJECT_STATUS } from "../constants";
import { Tender } from "./interfaces/tender";
import { Document } from "./interfaces/document";
import { Location } from "./interfaces/location";
import { Contact } from "./interfaces/contact";
import { Company } from "./interfaces/company";
import { Tenant } from "./interfaces/tenant";
import { CompanyModel } from "./company";
import { LocationModel } from "./location";
import { ContactModel } from "./contact";
import { TenantModel } from "./tenant";
import { DocumentModel } from "./document";
import { Journey } from "./interfaces/journey";
import { JourneyModel } from "./journey";
import { TenderItemModel } from "./tender-item";
import { CreateProjectProperties, Project } from "./interfaces/project";
import { TenderModel } from "./tender";
import { Milestone } from "./interfaces/milestone";
import { MilestoneModel } from "./milestone";
import { ProjectItem } from "./interfaces/project-item";
import { ProjectItemModel } from "./project-item";
import type { Models } from ".";
import { ProjectCommentModel } from "./project-comment";
import { ProjectComment } from "./interfaces/project-comment";
import { getNetAmount, getVatAmount } from "../helpers/project";
import { TaskModel } from "./task";
import { WorkSiteEventModel } from "./work-site-event";

export class ProjectModel extends Model<Project, CreateProjectProperties> implements Project {
  public id!: number;

  public number!: string;

  public name?: string | null;

  public type!: string;

  public shortName?: string | null;

  public inSchedule!: boolean;

  public reports!: boolean;

  public contractOption?: string | null;

  public scheduleColor?: string | null;

  public supervisorBonus!: boolean;

  public status!: PROJECT_STATUS;

  public dueDate?: Date | null;

  public startDate?: Date | null;

  public endDate?: Date | null;

  public netAmount!: number;

  public vatAmount!: number;

  public vatKey!: string;

  public notes!: string | null;

  public inquiry!: string | null;

  public survey!: string | null;

  public locationDescription!: string | null;;

  public toolRequirements!: string | null;

  public otherComment!: string | null;

  public customerId!: ForeignKey<Company["id"]>;

  public customer?: NonAttribute<Company>;

  public setCustomer!: HasOneSetAssociationMixin<CompanyModel, number>;

  public getCustomer!: HasOneGetAssociationMixin<CompanyModel>;

  public contractorId!: ForeignKey<Company["id"]>;

  public contractor?: NonAttribute<Company>;

  public setContractor!: HasOneSetAssociationMixin<CompanyModel, number>;

  public getContractor!: HasOneGetAssociationMixin<CompanyModel>;

  public locationId!: ForeignKey<Location["id"]>;

  public location?: NonAttribute<Location>;

  public setLocation!: HasOneSetAssociationMixin<LocationModel, number>;

  public getLocation!: HasOneGetAssociationMixin<LocationModel>;

  public contactIds!: ForeignKey<Contact["id"][]>;

  public contacts?: NonAttribute<Contact[]>;

  public addContact!: HasManyAddAssociationMixin<ContactModel, number>;

  public setContact!: HasManySetAssociationsMixin<ContactModel, number>;

  public getContacts!: HasManyGetAssociationsMixin<ContactModel>;

  public supervisorIds!: ForeignKey<Contact["id"][]>;

  public supervisors?: NonAttribute<Contact[]>;

  public addSupervisor!: HasManyAddAssociationMixin<ContactModel, number>;

  public setSupervisor!: HasManySetAssociationsMixin<ContactModel, number>;

  public getSupervisors!: HasManyGetAssociationsMixin<ContactModel>;

  public commentIds!: ForeignKey<ProjectComment["id"][]>;

  public comments?: NonAttribute<ProjectComment[]>;

  public addComment!: HasManyAddAssociationMixin<ProjectCommentModel, number>;

  public getComments!: HasManyGetAssociationsMixin<ProjectCommentModel>;

  public getDocuments!: HasManyGetAssociationsMixin<DocumentModel[]>;

  public createDocument!: HasManyCreateAssociationMixin<DocumentModel>;

  declare documents?: NonAttribute<Document[]>;

  declare documentIds?: ForeignKey<Document["id"][]>;

  public journeys?: NonAttribute<Journey[]>;

  public getJourneys!: HasManyGetAssociationsMixin<Journey[]>;

  public createJourney!: HasManyCreateAssociationMixin<JourneyModel>;

  public getItems!: HasManyGetAssociationsMixin<ProjectItemModel[]>;

  public createItem!: HasManyCreateAssociationMixin<ProjectItemModel>;

  declare items?: NonAttribute<ProjectItem[]>;

  declare itemsIds?: ForeignKey<ProjectItem["id"][]>;

  public getMilestones!: HasManyGetAssociationsMixin<ProjectItemModel[]>;

  public createMilestone!: HasManyCreateAssociationMixin<ProjectItemModel>;

  declare milestones?: NonAttribute<Milestone[]>;

  declare milestoneIds?: ForeignKey<Milestone["id"][]>;

  public tenantId!: ForeignKey<Tenant["id"]>;

  public tenant?: NonAttribute<Tenant>;

  public tenderId!: ForeignKey<Tender["id"]>;

  public tender?: NonAttribute<Tender>;

  public readonly createdOn!: Date;

  public readonly updatedOn!: Date | null;

  public readonly createdBy!: number;

  public readonly updatedBy!: number | null;

  public static associate: (models: Models) => void;

  public static associations: {
    documents: Association<ProjectModel, DocumentModel>,
    tenant: Association<ProjectModel, TenantModel>,
    tender: Association<ProjectModel, TenderModel>,
    customer: Association<ProjectModel, CompanyModel>,
    contractor: Association<ProjectModel, CompanyModel>,
    location: Association<ProjectModel, LocationModel>,
    contacts: Association<ProjectModel, ContactModel>
    supervisors: Association<ProjectModel, ContactModel>
    items: Association<ProjectModel, TenderItemModel>,
    milestones: Association<ProjectModel, MilestoneModel>
    comments: Association<ProjectModel, ProjectCommentModel>
    tasks: Association<ProjectModel, TaskModel>
  };

  public readonly itemsNetAmount?: number;

  public readonly itemsVatAmount?: number;

  public readonly itemsTotalAmount?: number;
};

export const ProjectFactory = (sequelize: Sequelize): typeof ProjectModel => {
  ProjectModel.init({
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: PROJECT_STATUS.IN_PROGRESS
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    vatKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contractOption: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    reports: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    inquiry: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    survey: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    locationDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    toolRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    otherComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    contractorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tenderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    netAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    vatAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    supervisorBonus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    inSchedule: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    scheduleColor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    shortName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    createdBy: {
      type: DataTypes.INTEGER
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    createdOn: {
      type: DataTypes.DATE
    },
    updatedOn: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true
    },
    itemsNetAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        return getNetAmount(this);
      }
    },
    itemsVatAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        return getVatAmount(this);
      }
    },
    itemsTotalAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        return getNetAmount(this) + getVatAmount(this);
      }
    }
  }, {
    sequelize,
    tableName: "projects",
    timestamps: true,
    createdAt: "createdOn",
    updatedAt: "updatedOn",
    paranoid: false,
    underscored: true
  });

  ProjectModel.associate = (models) => {
    ProjectModel.hasMany(models.Document, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "project"
      },
      as: "documents"
    });

    ProjectModel.hasMany(models.ProjectItem, {
      foreignKey: "projectId",
      as: "items"
    });

    ProjectModel.hasMany(models.Milestone, {
      foreignKey: "projectId",
      as: "milestones"
    });

    ProjectModel.belongsTo(models.Tenant, {
      foreignKey: "tenantId",
      as: "tenant"
    });

    ProjectModel.belongsTo(models.Tender, {
      foreignKey: "tenderId",
      as: "tender"
    });

    ProjectModel.belongsTo(models.Company, {
      foreignKey: "customerId",
      as: "customer"
    });

    ProjectModel.belongsTo(models.Company, {
      foreignKey: "contractorId",
      as: "contractor"
    });

    ProjectModel.belongsTo(models.Location, {
      foreignKey: "locationId",
      as: "location"
    });

    ProjectModel.belongsToMany(models.Contact, {
      foreignKey: "projectId",
      through: models.ProjectContact,
      as: "contacts"
    });

    ProjectModel.belongsToMany(models.Contact, {
      foreignKey: "projectId",
      through: models.ProjectSupervisor,
      as: "supervisors"
    });

    ProjectModel.hasMany(models.Journey, {
      foreignKey: "owner_id",
      scope: {
        ownerType: "tender"
      },
      as: "journeys",
    });

    ProjectModel.hasMany(models.ProjectComment, {
      foreignKey: "projectId",
      as: "comments"
    });

    ProjectModel.hasMany(models.OrderForm, {
      foreignKey: "projectId",
      as: "orderForms"
    });

    ProjectModel.hasMany(models.Invoice, {
      foreignKey: "project_id",
      as: "invoices"
    });

    ProjectModel.hasMany(models.Task, {
      foreignKey: "projectId",
      as: "tasks",
    });

    ProjectModel.hasMany(models.WorkSiteEvent, {
      foreignKey: "projectId",
      as: "workSiteEvents",
    });
  };

  return ProjectModel;
};

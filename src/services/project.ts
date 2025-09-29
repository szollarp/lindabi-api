import { NotAcceptable } from "http-errors";
import type { Context, DecodedUser } from "../types";
import type { Project } from "../models/interfaces/project";
import type { CreateDocumentProperties, Document, DocumentOwnerType, DocumentType } from "../models/interfaces/document";
import { PROJECT_COLORS, PROJECT_ITEM_STATUS, PROJECT_ITEM_TYPE, PROJECT_STATUS, TENDER_STATUS } from "../constants";
import { getAmountByDiscount, getTotalNetAmount, getTotalVatAmount } from "../helpers/tender";
import { Op } from "sequelize";
import { CreateMilestoneProperties, Milestone } from "../models/interfaces/milestone";
import { CreateProjectItemProperties, ProjectItem } from "../models/interfaces/project-item";
import { Journey } from "../models/interfaces/journey";
import { getUserProjectIds } from "../helpers/project";
import { ProjectComment } from "../models/interfaces/project-comment";
import { Invoice } from "../models/interfaces/invoice";

export interface ProjectFilters {
  status?: PROJECT_STATUS;
  customerId?: number;
  contractorId?: number;
  locationId?: number;
  contactId?: number;
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
}

export interface ProjectSortOptions {
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface ProjectService {
  copyFromTender: (context: Context, user: DecodedUser, tenderId: number, contractOption: string, files: Express.Multer.File[]) => Promise<{ id: number }>
  updateProject: (context: Context, id: number, data: Partial<Project>, user: DecodedUser) => Promise<{ updated: boolean }>
  getProjects: (context: Context, tenantId: number, page?: number, limit?: number, filters?: ProjectFilters, sortOptions?: ProjectSortOptions) => Promise<{ data: Array<Partial<Project>>, total: number, page: number, limit: number }>
  getBasicProjects: (context: Context, tenantId: number) => Promise<Partial<Project>[]>
  getProjectStatusCounts: (context: Context, tenantId: number) => Promise<Record<string, number>>
  getProject: (context: Context, tenantId: number, id: number) => Promise<Partial<Project> | null>
  updateProjectContact: (context: Context, user: DecodedUser, projectId: number, contactId: number, body: { canShow: boolean, userContact: boolean }) => Promise<void>
  addProjectContact: (context: Context, user: DecodedUser, projectId: number, contactId: number) => Promise<void>
  removeProjectContact: (context: Context, user: DecodedUser, projectId: number, contactId: number) => Promise<void>
  addProjectSupervisor: (context: Context, user: DecodedUser, projectId: number, contactId: number) => Promise<void>
  removeProjectSupervisor: (context: Context, user: DecodedUser, projectId: number, contactId: number) => Promise<void>
  getProjectColors: (context: Context, tenantId: number) => Promise<string[]>
  addMilestone: (context: Context, user: DecodedUser, projectId: number, body: CreateMilestoneProperties) => Promise<{ updated: boolean }>
  updateMilestone: (context: Context, user: DecodedUser, projectId: number, milestoneId: number, body: Partial<Milestone>) => Promise<{ updated: boolean }>
  removeMilestone: (context: Context, user: DecodedUser, projectId: number, milestoneId: number) => Promise<{ updated: boolean }>
  createProjectItem: (context: Context, projectId: number, user: DecodedUser, data: CreateProjectItemProperties) => Promise<ProjectItem>
  updateProjectItem: (context: Context, projectId: number, id: number, user: DecodedUser, data: Partial<ProjectItem>) => Promise<Partial<ProjectItem> | null>
  updateProjectItemOrder: (context: Context, projectId: number, id: number, user: DecodedUser, data: { side: "up" | "down" }) => Promise<{ success: boolean }>
  removeProjectItem: (context: Context, user: DecodedUser, projectId: number, id: number) => Promise<{ success: boolean }>
  getDocuments: (context: Context, id: number) => Promise<Partial<Document>[] | []>
  getDocument: (context: Context, id: number, documentId: number) => Promise<Partial<Document> | null>
  getJourneys: (context: Context, id: number) => Promise<Partial<Journey>[] | []>
  uploadDocuments: (context: Context, id: number, user: DecodedUser, documents: CreateDocumentProperties[]) => Promise<{ uploaded: boolean }>
  removeDocuments: (context: Context, id: number, user: DecodedUser, type: string) => Promise<{ success: boolean }>
  removeDocument: (context: Context, id: number, user: DecodedUser, documentId: number) => Promise<{ success: boolean }>
  addComment: (context: Context, user: DecodedUser, projectId: number, body: { notes: string }) => Promise<{ updated: boolean }>
  updateComment: (context: Context, user: DecodedUser, projectId: number, commentId: number, body: Partial<ProjectComment>) => Promise<{ updated: boolean }>
  removeComment: (context: Context, user: DecodedUser, projectId: number, commentId: number) => Promise<{ updated: boolean }>
  removeProject: (context: Context, user: DecodedUser, projectId: number) => Promise<{ success: boolean }>
  removeProjects: (context: Context, user: DecodedUser, projectIds: number[]) => Promise<{ success: boolean }>
  getInvoices: (context: Context, tenantId: number, id: number) => Promise<Invoice[]>
  getItemsByProjectType: (context: Context, tenantId: number, id: number) => Promise<Partial<ProjectItem>[]>
}

export const projectService = (): ProjectService => {
  const copyFromTender = async (context: Context, user: DecodedUser, tenderId: number, contractOption: string, files: Express.Multer.File[]): Promise<{ id: number }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const tender = await context.models.Tender.findOne({
        where: { id: tenderId },
        attributes: ["id", "type", "number", "locationId", "customerId", "contractorId", "notes", "survey", "locationDescription",
          "toolRequirements", "otherComment", "inquiry", "vatKey", "tenantId", "surcharge", "discount", "shortName"],
        include: [{
          model: context.models.TenderItem,
          as: "items",
          required: true
        }, {
          model: context.models.Company,
          as: "customer",
          attributes: ["id"],
          include: [{
            model: context.models.Contact,
            as: "contacts",
            attributes: ["id", "userId"]
          }]
        },],
        transaction: t
      });

      if (!tender) {
        throw new NotAcceptable("Tender not found");
      }

      const netAmount = getTotalNetAmount(tender);
      const vatAmount = getTotalVatAmount(tender);
      const { items, customer, shortName, ...attributes } = tender.toJSON();

      const project = await context.models.Project.create({
        ...attributes,
        contractOption,
        tenderId,
        netAmount,
        vatAmount,
        name: shortName,
        createdBy: user.id,
        status: PROJECT_STATUS.ORDERED,
      } as any, { transaction: t });

      for (const item of items!) {
        const { name, quantity, unit, num, materialNetAmount, feeNetAmount } = item;

        await context.models.ProjectItem.create({
          name,
          quantity,
          unit,
          num,
          materialNetAmount: getAmountByDiscount(tender, materialNetAmount),
          feeNetAmount: getAmountByDiscount(tender, feeNetAmount),
          projectId: project.id,
          createdBy: user.id,
          type: PROJECT_ITEM_TYPE.ITEMIZED,
          status: PROJECT_ITEM_STATUS.OPEN,
          netAmount: getAmountByDiscount(tender, item.netAmount!)
        } as ProjectItem, { transaction: t });
      }

      if (files && files.length > 0) {
        await context.services.document.upload(context, user, project.id, "project", "contract", files, {}, false);
      }

      if (customer!.contacts && customer!.contacts.length) {
        for (const contact of customer!.contacts) {
          await context.models.ProjectContact.create({
            projectId: project.id,
            contactId: contact.id,
            userContact: !!contact.userId,
            customerContact: true,
            canShow: !!contact.userId
          });
        }
      }

      await tender.update({ status: TENDER_STATUS.ORDERED }, { transaction: t });

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project have been successfully created from the tender.`,
        property: "Project",
        updated: tender.number
      }, project.id, "project");

      await t.commit();
      return { id: project.id };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  const updateProject = async (context: Context, id: number, data: Partial<Project>, user: DecodedUser): Promise<{ updated: boolean }> => {
    try {
      const project = await context.models.Project.findOne({
        where: { id }
      });

      if (!project) {
        return { updated: false };
      }

      await context.services.journey.addDiffLogs(context, user, {
        activity: `The project have been successfully updated.`,
        existed: project,
        updated: data
      }, project.id, "project");

      await project.update({ ...data, updatedBy: user.id });
      return { updated: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getProjects = async (context: Context, tenantId: number, page: number = 1, limit: number = 25, filters: ProjectFilters = {}, sortOptions: ProjectSortOptions = {}): Promise<{ data: Array<Partial<Project>>, total: number, page: number, limit: number }> => {
    try {
      // Build base where clause
      const whereClause: any = { tenantId };

      // Apply basic filters
      if (filters.status) whereClause.status = filters.status;
      if (filters.customerId) whereClause.customerId = filters.customerId;
      if (filters.contractorId) whereClause.contractorId = filters.contractorId;
      if (filters.locationId) whereClause.locationId = filters.locationId;
      if (filters.contactId) whereClause.contactId = filters.contactId;

      // Apply date filters
      if (filters.startDate || filters.endDate) {
        whereClause.createdOn = {};
        if (filters.startDate) whereClause.createdOn[Op.gte] = filters.startDate;
        if (filters.endDate) whereClause.createdOn[Op.lte] = filters.endDate;
      }

      // Apply keyword search with enhanced accent handling
      if (filters.keyword) {
        // Create multiple search patterns for accent-insensitive search
        const createSearchPatterns = (text: string): string[] => {
          const patterns: string[] = [];
          const normalized = text.toLowerCase();

          // Original text
          patterns.push(`%${normalized}%`);

          // Common accent variations for Hungarian
          const accentMap: { [key: string]: string[] } = {
            'a': ['á'],
            'e': ['é'],
            'i': ['í'],
            'o': ['ó', 'ö', 'ő'],
            'u': ['ú', 'ü', 'ű'],
          };

          // Generate patterns with common accent variations
          // Create all possible combinations of accent variations
          const generateVariations = (text: string, baseIndex: number = 0): string[] => {
            if (baseIndex >= Object.keys(accentMap).length) {
              return [text];
            }

            const base = Object.keys(accentMap)[baseIndex];
            const accents = accentMap[base];
            const variations: string[] = [];

            if (text.includes(base)) {
              // Generate variations for this base character
              for (const accent of accents) {
                const variant = text.replace(new RegExp(base, 'g'), accent);
                variations.push(...generateVariations(variant, baseIndex + 1));
              }
              // Also keep the original for other base characters
              variations.push(...generateVariations(text, baseIndex + 1));
            } else {
              // No this base character, continue with next
              variations.push(...generateVariations(text, baseIndex + 1));
            }

            return variations;
          };

          const variations = generateVariations(normalized);
          patterns.push(...variations.map(v => `%${v}%`));

          return patterns;
        };

        const searchPatterns = createSearchPatterns(filters.keyword);

        whereClause[Op.or] = [
          // Direct project fields
          { name: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { number: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { type: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { notes: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { location_description: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { tool_requirements: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { other_comment: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          // Related fields
          { '$customer.name$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$customer.address$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$customer.city$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$customer.zip_code$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$customer.tax_number$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$supervisors.name$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$supervisors.email$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$supervisors.phone_number$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$items.name$': { [Op.iLike]: { [Op.any]: searchPatterns } } }
        ];
      }

      const offset = (page - 1) * limit;

      // Build sorting options
      const orderBy = sortOptions.orderBy || 'updatedOn';
      const order = sortOptions.order || 'desc';

      // Map frontend field names to database field names
      const fieldMapping: { [key: string]: string } = {
        'customer.name': '$customer.name$',
        'type': 'type',
        'createdOn': 'createdOn',
        'updatedOn': 'updatedOn',
        'dueDate': 'dueDate',
        'status': 'status',
        'name': 'name',
        'number': 'number',
        'itemsNetAmount': 'itemsNetAmount',
        'itemsTotalAmount': 'itemsTotalAmount'
      };

      const dbField = fieldMapping[orderBy] || orderBy;
      const sortOrder = order.toUpperCase() as 'ASC' | 'DESC';

      // Handle virtual fields that need special sorting
      let orderClause: any;
      if (orderBy === 'itemsNetAmount' || orderBy === 'itemsTotalAmount') {
        // For virtual fields, we need to sort by the calculated amount
        // This requires a more complex query with subqueries
        orderClause = [['updatedOn', sortOrder]]; // Fallback to updatedOn for now
      } else if (fieldMapping[orderBy]) {
        // Use mapped field if it exists
        orderClause = [[dbField, sortOrder]];
      } else {
        // Fallback to updatedOn for unknown fields
        context.logger.warn(`Unknown sort field: ${orderBy}, falling back to updatedOn`);
        orderClause = [['updatedOn', sortOrder]];
      }

      // Define includes for queries
      const baseIncludes = [
        {
          model: context.models.Contact,
          as: "supervisors",
          attributes: [],
          required: false
        },
        {
          model: context.models.Company,
          as: "customer",
          attributes: [],
          required: false
        },
        {
          model: context.models.Company,
          as: "contractor",
          attributes: [],
          required: false
        },
        {
          model: context.models.ProjectItem,
          as: "items",
          attributes: [],
          required: false
        }
      ];

      const fullIncludes = [
        {
          model: context.models.Task,
          as: "tasks",
          attributes: ["title"],
          include: [
            {
              model: context.models.User,
              as: "assignee",
              attributes: ["name"],
              include: [
                {
                  model: context.models.Document,
                  attributes: ["id", "name", "mimeType", "type", "stored"],
                  as: 'documents',
                  required: false,
                  where: {
                    type: 'avatar',
                  }
                }
              ],
            },
            {
              model: context.models.TaskColumn,
              as: "column",
              where: {
                finished: false,
              },
              required: true
            }
          ]
        },
        {
          model: context.models.Location,
          as: "location",
          attributes: ["id", "city", "country", "zipCode", "address"],
          required: false
        },
        {
          model: context.models.Company,
          as: "customer",
          attributes: ["id", "prefix", "email", "name", "address", "city", "zipCode", "taxNumber", "bankAccount"],
          required: false
        },
        {
          model: context.models.Company,
          as: "contractor",
          attributes: ["id", "name"],
          required: false
        },
        {
          model: context.models.Contact,
          as: "supervisors",
          attributes: ["id", "name"],
          required: false
        },
        {
          model: context.models.Milestone,
          as: "milestones",
          attributes: ["id", "name", "status"],
          required: false
        },
        {
          model: context.models.ProjectItem,
          as: "items",
          attributes: ["id", "netAmount"],
          required: false
        },
        {
          model: context.models.Tender,
          as: "tender",
          required: false,
          include: [{
            model: context.models.TenderItem,
            as: "items",
            required: false
          }]
        }
      ];

      // Use a consistent approach for both count and data
      // First get all matching project IDs to ensure consistency
      const allMatchingProjects = await context.models.Project.findAll({
        where: whereClause,
        include: baseIncludes,
        attributes: ['id'],
        order: orderClause,
        subQuery: false
      });

      // Get unique project IDs and total count
      const uniqueProjectIds = [...new Set(allMatchingProjects.map(p => p.id))];
      const total = uniqueProjectIds.length;

      // Apply pagination to the unique IDs
      const paginatedIds = uniqueProjectIds.slice(offset, offset + limit);

      // Get full data for the paginated IDs
      const data = await context.models.Project.findAll({
        where: {
          id: { [Op.in]: paginatedIds },
          tenantId
        },
        attributes: ["id", "number", "status", "name", "createdOn", "updatedOn", "type", "dueDate", "itemsNetAmount", "itemsVatAmount", "itemsTotalAmount", "inSchedule", "scheduleColor", "vatKey"],
        include: fullIncludes,
        order: orderClause,
        subQuery: false
      });

      return {
        data: data as any,
        total,
        page,
        limit
      };
    } catch (error) {
      throw error;
    }
  };

  const getBasicProjects = async (context: Context, tenantId: number): Promise<Array<Partial<Project>>> => {
    try {
      return await context.models.Project.findAll({
        where: { tenantId },
        attributes: ["id", "name", "status", "number", "type"],
        include: [
          {
            model: context.models.Company,
            as: "customer",
            attributes: ["id", "name"]
          }
        ],
        order: [["name", "DESC"]]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getProjectStatusCounts = async (context: Context, tenantId: number): Promise<Record<string, number>> => {
    try {
      const counts = await context.models.Project.findAll({
        attributes: [
          'status',
          [context.models.sequelize.fn('COUNT', context.models.sequelize.col('id')), 'count']
        ],
        where: { tenantId },
        group: ['status'],
        raw: true
      });

      const statusCounts: Record<string, number> = {};
      counts.forEach((item: any) => {
        statusCounts[item.status] = parseInt(item.count);
      });

      return statusCounts;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getProject = async (context: Context, tenantId: number, id: number): Promise<Partial<Project> | null> => {
    try {
      return await context.models.Project.findOne({
        where: { tenantId, id },
        include: [
          {
            model: context.models.Contact,
            as: "contacts",
            attributes: ["name", "id", "userId"],
            through: {
              attributes: ["canShow", "userContact", "customerContact",],
              as: "attributes"
            }
          },
          {
            model: context.models.Contact,
            as: "supervisors",
            attributes: ["name", "id", "userId"],
            through: {
              attributes: ["startDate", "endDate", "createdOn"],
              as: "attributes",
            }
          },
          {
            model: context.models.Location,
            as: "location",
            attributes: ["id", "city", "country", "zipCode", "address"]
          },
          {
            model: context.models.Company,
            as: "customer",
            attributes: ["id", "prefix", "email", "name", "address", "city", "zipCode", "taxNumber", "bankAccount"],
          },
          {
            model: context.models.Company,
            as: "contractor",
            attributes: ["id", "prefix", "email", "name", "address", "city", "zipCode", "taxNumber", "bankAccount"],
            include: [
              {
                model: context.models.Document,
                as: "documents",
                attributes: ["id", "name", "type", "mimeType", "stored"]
              }
            ]
          },
          {
            model: context.models.ProjectItem,
            as: "items",
            required: false,
            order: [["num", "ASC"]]
          },
          {
            model: context.models.Milestone,
            as: "milestones",
            required: false,
            include: [
              {
                model: context.models.Document,
                as: "documents",
                attributes: ["id", "name", "type", "mimeType", "stored"]
              }
            ]
          },
          {
            model: context.models.ProjectComment,
            as: "comments",
            attributes: ["id", "notes", "createdOn", "updatedOn", "createdBy", "updatedBy", "checked"],
            include: [
              {
                model: context.models.Contact,
                as: "contact",
                attributes: ["name"],
                order: [["createdOn", "ASC"]]
              }
            ]
          },
          {
            model: context.models.Tender,
            as: "tender",
            attributes: ["id", "currency"]
          }
        ],
      });
    } catch (error) {
      throw error;
    }
  };

  const updateProjectContact = async (context: Context, user: DecodedUser, projectId: number, contactId: number, body: { canShow: boolean, userContact: boolean }): Promise<void> => {
    try {
      const projectContact = await context.models.ProjectContact.findOne({
        where: { projectId, contactId }
      });

      if (!projectContact) {
        throw new NotAcceptable("Project contact not found");
      }

      await projectContact.update(body);
      await context.services.journey.addDiffLogs(context, user, {
        activity: `The project contact have been successfully updated.`,
        existed: projectContact,
        updated: body
      }, projectId, "project");

    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const addProjectContact = async (context: Context, user: DecodedUser, projectId: number, contactId: number): Promise<void> => {
    try {
      const projectContact = await context.models.ProjectContact.findOne({
        where: { projectId, contactId }
      });

      if (projectContact) {
        throw new NotAcceptable("Project contact already exists");
      }

      const contact = await context.models.Contact.findOne({
        attributes: ["id", "userId", "name"],
        where: { id: contactId }
      });

      if (!contact) {
        throw new NotAcceptable("Project contact not exists");
      }

      await context.models.ProjectContact.create({
        projectId,
        contactId,
        userContact: !!contact.userId,
        customerContact: false,
        canShow: !!contact.userId
      });

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project contact have been successfully added.`,
        property: "Project Contact",
        updated: contact.name
      }, projectId, "project");

    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const removeProjectContact = async (context: Context, user: DecodedUser, projectId: number, contactId: number): Promise<void> => {
    try {
      const projectContact = await context.models.ProjectContact.findOne({
        where: { projectId, contactId }
      });

      if (!projectContact) {
        throw new NotAcceptable("Project contact not found");
      }

      await projectContact.destroy();

      const contact = await context.models.Contact.findOne({
        attributes: ["name"],
        where: { id: contactId }
      });

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project contact have been successfully removed.`,
        property: "Project Contact",
        updated: contact?.name,
      }, projectId, "project");

    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const addProjectSupervisor = async (context: Context, user: DecodedUser, projectId: number, contactId: number): Promise<void> => {
    const t = await context.models.sequelize.transaction();

    try {
      const projectSupervisor = await context.models.ProjectSupervisor.findOne({
        where: { projectId, contactId }, transaction: t
      });

      if (projectSupervisor) {
        throw new NotAcceptable("Project contact already exists");
      }

      const contact = await context.models.Contact.findOne({
        attributes: ["id", "userId", "name"],
        where: { id: contactId },
        transaction: t
      });

      if (!contact) {
        throw new NotAcceptable("Project contact not exists");
      }

      await context.models.ProjectSupervisor.update({ endDate: new Date() }, {
        where: { projectId, endDate: null },
        transaction: t
      });

      await context.models.ProjectSupervisor.create({
        projectId,
        contactId,
        startDate: new Date(),
      }, { transaction: t });

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project supervisor have been successfully added.`,
        property: "Project Supervisor",
        updated: contact.name
      }, projectId, "project");

      await t.commit();
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const removeProjectSupervisor = async (context: Context, user: DecodedUser, projectId: number, contactId: number): Promise<void> => {
    const t = await context.models.sequelize.transaction();

    try {
      const projectSupervisor = await context.models.ProjectSupervisor.findOne({
        where: { projectId, contactId }, transaction: t
      });

      if (!projectSupervisor) {
        throw new NotAcceptable("Project contact not found");
      }

      await projectSupervisor.destroy({ transaction: t });
      await context.models.ProjectSupervisor.update({ endDate: null }, {
        where: { projectId, endDate: projectSupervisor.startDate },
        transaction: t
      });

      const contact = await context.models.Contact.findOne({
        attributes: ["name"],
        where: { id: contactId },
        transaction: t
      });

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project supervisor have been successfully removed.`,
        property: "Project Supervisor",
        updated: contact?.name
      }, projectId, "project");

      await t.commit();
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const getProjectColors = async (context: Context, tenantId: number): Promise<string[]> => {
    const projects = await context.models.Project.findAll({
      where: {
        tenantId,
        inSchedule: true,
        scheduleColor: { [Op.ne]: null },
        status: { [Op.notIn]: [PROJECT_STATUS.CANCELLED, PROJECT_STATUS.CLOSED, PROJECT_STATUS.COMPLETED] }
      },
      attributes: ["scheduleColor"]
    });

    const usedColors = projects.map(project => project.scheduleColor);
    return PROJECT_COLORS.filter(color => !usedColors.includes(color));
  }

  const addMilestone = async (context: Context, user: DecodedUser, projectId: number, body: CreateMilestoneProperties): Promise<{ updated: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const project = await context.models.Project.findOne({
        where: { id: projectId },
        transaction: t
      });

      if (!project) {
        throw new NotAcceptable("Project not found");
      }

      const { documents, ...data } = body;

      const milestone = await context.models.Milestone.create({
        ...data,
        projectId,
        createdBy: user.id
      } as any, { transaction: t });

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The milestone have been successfully added.`,
        property: "Milestone",
        updated: milestone.name
      }, projectId, "project", t);

      if (documents && documents.length) {
        const remainingDocuments = documents.filter(document => !document.id);
        const documentsData = remainingDocuments.map(document => ({
          ...document,
          ownerId: milestone.id,
          ownerType: "milestone" as DocumentOwnerType,
          createdBy: user.id
        }));

        await context.models.Document.bulkCreate(documentsData, {
          transaction: t
        });

        for (const document of documents) {
          await context.services.journey.addSimpleLog(context, user, {
            activity: `The milestone document have been successfully uploaded.`,
            property: "Document",
            updated: document.name
          }, projectId, "project", t);
        }
      }

      await t.commit();
      return { updated: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const updateMilestone = async (context: Context, user: DecodedUser, projectId: number, milestoneId: number, body: Partial<Milestone>): Promise<{ updated: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const milestone = await context.models.Milestone.findOne({
        where: { id: milestoneId, projectId },
        transaction: t
      });

      const { documents, ...data } = body;

      if (!milestone) {
        throw new NotAcceptable("Milestone not found");
      }

      await context.services.journey.addDiffLogs(context, user, {
        activity: `The milestone have been successfully updated.`,
        existed: milestone,
        updated: data
      }, projectId, "project");

      await milestone.update(data, { transaction: t });

      if (documents && documents.length) {
        const remainingDocuments = documents.filter(document => !document.id);
        const documentsData = remainingDocuments.map(document => ({
          ...document,
          ownerId: milestone.id,
          ownerType: "milestone" as DocumentOwnerType,
          createdBy: user.id
        }));

        await context.models.Document.bulkCreate(documentsData, {
          transaction: t
        });

        for (const document of documents) {
          await context.services.journey.addSimpleLog(context, user, {
            activity: `The milestone document have been successfully uploaded.`,
            property: "Document",
            updated: document.name
          }, projectId, "project", t);
        }
      }

      await t.commit();
      return { updated: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const removeMilestone = async (context: Context, user: DecodedUser, projectId: number, milestoneId: number): Promise<{ updated: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const milestone = await context.models.Milestone.findOne({
        where: { id: milestoneId, projectId },
        transaction: t
      });

      if (!milestone) {
        throw new NotAcceptable("Milestone not found");
      }

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The milestone have been successfully removed.`,
        property: "Milestone",
        updated: milestone.name
      }, projectId, "project");

      await milestone.destroy({ transaction: t });

      await t.commit();
      return { updated: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const createProjectItem = async (context: Context, projectId: number, user: DecodedUser, data: CreateProjectItemProperties): Promise<ProjectItem> => {
    try {
      const numMax: number | null = await context.models.ProjectItem.max("num", { where: { projectId } });
      const max = numMax ? Number(numMax) + 1 : 1;

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project item have been successfully created.`,
        property: "Project Item",
        updated: data.name
      }, projectId, "project");


      return await context.models.ProjectItem.create({
        ...data,
        projectId,
        createdBy: user.id,
        num: max
      } as any);

    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const updateProjectItem = async (context: Context, projectId: number, id: number, user: DecodedUser, data: Partial<ProjectItem>): Promise<Partial<ProjectItem> | null> => {
    const t = await context.models.sequelize.transaction();

    try {
      const projectItem = await context.models.ProjectItem.findOne({
        where: { id, projectId }
      });

      if (!projectItem) {
        return null;
      }

      await context.services.journey.addDiffLogs(context, user, {
        activity: `The project item have been successfully updated.`,
        existed: projectItem,
        updated: data
      }, projectId, "project");

      await projectItem.update({ ...data, updatedBy: user.id }, { transaction: t });

      await context.models.Project.update({ updatedOn: new Date() }, {
        where: { id: projectId },
        transaction: t
      });

      await t.commit();

      return projectItem;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  const updateProjectItemOrder = async (context: Context, projectId: number, id: number, user: DecodedUser, data: { side: "up" | "down" }): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const item = await context.models.ProjectItem.findOne({
        where: { id, projectId }
      });

      if (!item) {
        return { success: false };
      }

      const num = data.side === "up" ? item.num - 1 : item.num + 1;
      const tenderNum = await context.models.ProjectItem.findOne({
        where: { projectId, num }
      });

      await item.update({
        ...data, updatedBy: user.id, num: data.side === "up" ? item.num - 1 : item.num + 1
      }, { transaction: t });

      await tenderNum?.update(
        {
          num: data.side === "up" ? tenderNum.num + 1 : tenderNum.num - 1,
          updatedBy: user.id
        }
      ), { transaction: t };

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project item have been successfully updated.`,
        property: "Project Item",
        updated: item.name
      }, projectId, "project");

      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const removeProjectItem = async (context: Context, user: DecodedUser, projectId: number, id: number): Promise<{ success: boolean }> => {
    try {
      const projectItem = await context.models.ProjectItem.findOne({
        where: { id, projectId },
        attributes: ["id", "name"]
      });

      await projectItem?.destroy();

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project item have been successfully removed.`,
        property: "Project Item",
        updated: projectItem?.name,
      }, projectId, "project");

      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getDocuments = async (context: Context, id: number): Promise<Partial<Document>[] | []> => {
    try {
      return await context.models.Document.findAll({
        where: { ownerId: id, ownerType: "project" },
        attributes: ["id", "name", "type", "mimeType", "stored"],
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getDocument = async (context: Context, id: number, documentId: number): Promise<Partial<Document> | null> => {
    try {
      return await context.models.Document.findOne({
        where: { ownerId: id, ownerType: "project", id: documentId },
        attributes: ["id", "name", "type", "mimeType", "stored"],
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getJourneys = async (context: Context, id: number): Promise<Partial<Journey>[] | []> => {
    try {
      return await context.services.journey.getLogs(context, id, "project");
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const uploadDocuments = async (context: Context, id: number, user: DecodedUser, documents: CreateDocumentProperties[]): Promise<{ uploaded: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      for (const document of documents) {
        await context.models.Document.create({
          ...document, ownerId: id, ownerType: "project"
        }, { transaction: t });

        await context.services.journey.addSimpleLog(context, user, {
          activity: `The project document have been successfully uploaded.`,
          property: `${document.type} documents`,
          updated: document.name
        }, id, "project");
      };

      await t.commit();
      return { uploaded: true };
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  }

  const removeDocuments = async (context: Context, id: number, user: DecodedUser, type: string): Promise<{ success: boolean }> => {
    try {
      const documents = await context.models.Document.findAll({
        attributes: ["name", "id", "type"],
        where: { ownerId: id, ownerType: "project", type }
      });

      for (const document of documents) {
        await context.services.journey.addSimpleLog(context, user, {
          activity: `document have been successfully removed.`,
          property: `Document`,
          updated: document.name
        }, id, "project");

        await document.destroy();
      }

      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const removeDocument = async (context: Context, id: number, user: DecodedUser, documentId: number): Promise<{ success: boolean }> => {
    try {
      const document = await context.models.Document.findOne({
        attributes: ["name", "id", "type"],
        where: { id: documentId, ownerId: id, ownerType: "project" }
      });

      if (document) {
        await context.services.journey.addSimpleLog(context, user, {
          activity: `${document.type} document have been successfully removed.`,
          property: `Document Name`,
          updated: document.name
        }, id, "project");

        await document.destroy();
      }

      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const addComment = async (context: Context, user: DecodedUser, projectId: number, body: { notes: string }): Promise<{ updated: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const project = await context.models.Project.findOne({
        where: { id: projectId },
        transaction: t
      });

      if (!project) {
        throw new NotAcceptable("Project not found");
      }

      const contact = await context.models.Contact.findOne({
        where: { userId: user.id }
      });

      if (!contact) {
        throw new NotAcceptable("Contact not found");
      }

      await context.models.ProjectComment.create({
        ...body,
        projectId,
        contactId: contact.id,
        createdBy: user.id
      } as any, { transaction: t });

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project comment have been successfully added.`,
        property: "Project Comment",
        updated: body.notes
      }, projectId, "project");

      await t.commit();
      return { updated: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const updateComment = async (context: Context, user: DecodedUser, projectId: number, commentId: number, body: Partial<ProjectComment>): Promise<{ updated: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const comment = await context.models.ProjectComment.findOne({
        where: { id: commentId, projectId },
        transaction: t
      });

      if (!comment) {
        throw new NotAcceptable("Comment not found");
      }

      await context.services.journey.addDiffLogs(context, user, {
        activity: `The project comment have been successfully updated.`,
        existed: comment,
        updated: body
      }, projectId, "project");

      await comment.update({
        ...body,
        updatedBy: user.id
      }, { transaction: t });

      await t.commit();
      return { updated: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const removeComment = async (context: Context, user: DecodedUser, projectId: number, commentId: number): Promise<{ updated: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const comment = await context.models.ProjectComment.findOne({
        where: { id: commentId, projectId },
        transaction: t
      });

      if (!comment) {
        throw new NotAcceptable("Comment not found");
      }

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project comment have been successfully removed.`,
        property: "Project Comment",
        updated: comment.notes
      }, projectId, "project");

      await comment.destroy({ transaction: t });

      await t.commit();
      return { updated: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const removeProject = async (context: Context, user: DecodedUser, projectId: number): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const project = await context.models.Project.findOne({
        where: { id: projectId },
        transaction: t
      });

      if (!project) {
        throw new NotAcceptable("Project not found");
      }

      await context.services.journey.addSimpleLog(context, user, {
        activity: `The project have been successfully removed.`,
        property: "Project",
        updated: project.name
      }, projectId, "project");

      await project.destroy({ transaction: t });

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const removeProjects = async (context: Context, user: DecodedUser, projectIds: number[]): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const projects = await context.models.Project.findAll({
        where: { id: { [Op.in]: projectIds } },
        transaction: t
      });

      for (const project of projects) {
        await context.services.journey.addSimpleLog(context, user, {
          activity: `The project have been successfully removed.`,
          property: "Project",
          updated: project.name
        }, project.id, "project");

        await project.destroy({ transaction: t });
      }

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const getInvoices = async (context: Context, tenantId: number, id: number): Promise<Invoice[]> => {
    try {
      return await context.models.Invoice.findAll({
        where: { projectId: id, tenantId },
        attributes: ["id", "invoiceNumber", "type", "netAmount", "vatAmount", "status", "createdOn", "completionDate", "issueDate"],
        include: [{
          model: context.models.Document,
          as: "documents"
        }, {
          model: context.models.Project,
          attributes: ["id", "type", "shortName"],
          as: "project",
          required: true,
          include: [{
            model: context.models.Company,
            as: "contractor",
            attributes: ["id", "name"]
          },
          {
            model: context.models.Location,
            as: "location",
            attributes: ["id", "name"]
          }],
        }, {
          model: context.models.Company,
          as: "supplier",
          attributes: ["id", "name"]
        }, {
          model: context.models.User,
          attributes: ["id", "name"],
          as: "creator"
        }, {
          model: context.models.User,
          attributes: ["id"],
          as: "employee"
        }],
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getItemsByProjectType = async (context: Context, tenantId: number, id: number): Promise<Partial<ProjectItem>[]> => {
    try {
      const project = await context.models.Project.findOne({
        where: { tenantId, id },
        attributes: ["type"]
      });

      if (!project) {
        return [];
      }

      return await context.models.ProjectItem.findAll({
        attributes: ["id", "name"],
        order: [["num", "ASC"]],
        include: [
          {
            model: context.models.Project,
            as: "project",
            attributes: ["type"],
            where: { tenantId, type: project.type },
            required: true,
          }
        ]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    copyFromTender,
    getProjects,
    getBasicProjects,
    getProject,
    updateProjectContact,
    addProjectContact,
    removeProjectContact,
    addProjectSupervisor,
    removeProjectSupervisor,
    getProjectColors,
    addMilestone,
    updateMilestone,
    removeMilestone,
    createProjectItem,
    updateProjectItem,
    updateProjectItemOrder,
    removeProjectItem,
    getDocuments,
    getDocument,
    getJourneys,
    uploadDocuments,
    removeDocuments,
    removeDocument,
    updateProject,
    addComment,
    updateComment,
    removeComment,
    removeProject,
    removeProjects,
    getInvoices,
    getItemsByProjectType,
    getProjectStatusCounts
  };
}
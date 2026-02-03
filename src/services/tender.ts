import { Op, Transaction, QueryTypes, Sequelize } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
import type { Context, DecodedUser } from "../types";
import type { CreateTenderProperties, Tender } from "../models/interfaces/tender";
import { CreateDocumentProperties, Document } from "../models/interfaces/document";
import { Journey } from "../models/interfaces/journey";
import { CreateTenderItemProperties, TenderItem } from "../models/interfaces/tender-item";
import { TENDER_STATUS } from "../constants";
import { calculateTenderItemAmounts } from "../helpers/tender";
import { TenderDuplicateCleanup } from "../helpers/tender-duplicate-cleanup";

export interface TenderFilters {
  status?: TENDER_STATUS | { [Op.ne]: TENDER_STATUS };
  customerId?: number;
  contractorId?: number;
  locationId?: number;
  contactId?: number;
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
}

export interface TenderSortOptions {
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface TenderService {
  getTenders: (context: Context, tenantId: number, page?: number, limit?: number, filters?: TenderFilters, sortOptions?: TenderSortOptions) => Promise<{ data: Array<Partial<Tender>>, total: number, page: number, limit: number }>
  getBasicTenders: (context: Context, tenantId: number) => Promise<Array<Partial<Tender>>>
  getTender: (context: Context, tenantId: number, id: number) => Promise<Partial<Tender> | null>
  getTenderDocuments: (context: Context, id: number) => Promise<Partial<Document>[] | []>
  sendTenderViaEmail: (context: Context, user: DecodedUser, id: number, message: string, content: Blob) => Promise<{ success: boolean }>
  removeAllTenderDocuments: (context: Context, id: number, user: DecodedUser, type: string) => Promise<{ success: boolean }>
  removeTenderDocument: (context: Context, id: number, user: DecodedUser, documentId: number) => Promise<{ success: boolean }>
  getTenderDocument: (context: Context, id: number, documentId: number) => Promise<Partial<Document> | null>
  createTender: (context: Context, tenantId: number, user: DecodedUser, data: CreateTenderProperties) => Promise<Partial<Tender> | null>
  uploadTenderDocuments: (context: Context, id: number, user: DecodedUser, documents: CreateDocumentProperties[]) => Promise<{ uploaded: boolean }>
  updateTender: (context: Context, id: number, user: DecodedUser, data: Partial<Tender>) => Promise<{ statusChanged: boolean, tender: Partial<Tender> | null, status?: string }>
  updateTenderDateRange: (context: Context, id: number, user: DecodedUser, data: { startDate: string | null, endDate: string | null }) => Promise<{ success: boolean }>
  deleteTender: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteTenders: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
  getTenderJourneys: (context: Context, id: number) => Promise<Partial<Journey>[] | []>
  getTenderItems: (context: Context, tenantId: number, id: number) => Promise<Partial<TenderItem>[]>
  getItemsByTenderType: (context: Context, tenantId: number, id: number) => Promise<Partial<TenderItem>[]>
  createTenderItem: (context: Context, tenderId: number, user: DecodedUser, data: CreateTenderItemProperties) => Promise<TenderItem>
  updateTenderItem: (context: Context, tenderId: number, id: number, user: DecodedUser, data: Partial<TenderItem>) => Promise<Partial<TenderItem> | null>
  removeTenderItem: (context: Context, user: DecodedUser, tenderId: number, id: number) => Promise<{ success: boolean }>
  updateTenderItemOrder: (context: Context, tenderId: number, id: number, user: DecodedUser, data: { side: "up" | "down" }) => Promise<{ success: boolean }>
  copyTender: (context: Context, user: DecodedUser, id: number) => Promise<Partial<Tender> | null>
  copyTenderItem: (context: Context, sourceId: number, targetId: number, user: DecodedUser) => Promise<{ success: boolean }>
  findDuplicateTenderNumbers: (context: Context, tenantId: number) => Promise<Array<{ number: string; count: number; tenderIds: number[] }>>
  cleanupDuplicateTenderNumbers: (context: Context, tenantId: number) => Promise<{ cleaned: number; duplicates: Array<{ number: string; count: number; tenderIds: number[] }> }>
  getTenderNumberStats: (context: Context, tenantId: number) => Promise<{ totalTenders: number; tendersWithNumbers: number; uniqueNumbers: number; duplicates: number }>
  getTenderStatusCounts: (context: Context, tenantId: number) => Promise<Record<string, number>>
};

const ALLOWED_STATUSES = [TENDER_STATUS.SENT, TENDER_STATUS.FINALIZED, TENDER_STATUS.ORDERED];

export const tenderService = (): TenderService => {
  const checkTenderNumberExists = async (context: Context, number: string, tenantId: number, excludeId?: number): Promise<boolean> => {
    const whereClause: any = {
      number,
      tenantId
    };

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingTender = await context.models.Tender.findOne({
      where: whereClause,
      attributes: ['id']
    });

    return !!existingTender;
  };

  const nextTenderSeq = async (sequelize: Sequelize, { tenantId, contractorId, year }: { tenantId: number, contractorId: number, year: number }): Promise<string> => {
    const t = await sequelize.transaction();

    try {
      // Use a single atomic query to increment and return the sequence number
      // This prevents race conditions by using PostgreSQL's RETURNING clause
      const [result] = await sequelize.query(
        `
        INSERT INTO tender_number_counters (tenant_id, contractor_id, year, seq)
        VALUES (:tenantId, :contractorId, :year, 1)
        ON CONFLICT (tenant_id, contractor_id, year) 
        DO UPDATE SET 
          seq = tender_number_counters.seq + 1,
          updated_at = NOW()
        RETURNING seq
        `,
        {
          type: QueryTypes.SELECT,
          transaction: t,
          replacements: { tenantId, contractorId, year }
        }
      );

      await t.commit();

      return result["seq"];
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  const generateTenderNumber = async (context: Context, user: DecodedUser, tender: Tender, force = false): Promise<string | null> => {
    if (!force && tender.number) return tender.number;
    if (!ALLOWED_STATUSES.includes(tender.status) || !tender.contractorId) return null;

    const year = (tender.createdOn ? new Date(tender.createdOn) : new Date()).getUTCFullYear();
    const contractor = await context.models.Company.findOne({
      attributes: ['offerNum'],
      where: { id: tender.contractorId, type: 'contractor', tenantId: tender.tenantId },
    });

    if (!contractor?.offerNum) {
      return null;
    }

    const { sequelize } = context.models;
    const { tenantId, contractorId } = tender;

    // Retry mechanism to handle potential duplicates
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const seq = await nextTenderSeq(sequelize, { tenantId: tenantId!, contractorId, year });
        const number = `${contractor.offerNum}-${year}-${seq}`;

        // Check if this number already exists
        const numberExists = await checkTenderNumberExists(context, number, tenantId!, tender.id);

        if (!numberExists) {
          // Number is unique, proceed
          await context.services.journey.addSimpleLog(
            context, user,
            { activity: 'The tender number has been successfully generated.', property: 'number', updated: number },
            tender.id, 'tender'
          );

          return number;
        } else {
          // Number already exists, retry
          retryCount++;
          context.logger.warn(`Tender number ${number} already exists, retrying... (attempt ${retryCount}/${maxRetries})`);

          if (retryCount >= maxRetries) {
            throw new Error(`Failed to generate unique tender number after ${maxRetries} attempts`);
          }
        }
      } catch (error) {
        retryCount++;
        context.logger.error(`Error generating tender number (attempt ${retryCount}/${maxRetries}):`, error);

        if (retryCount >= maxRetries) {
          throw error;
        }
      }
    }

    return null;
  }

  const getTenders = async (context: Context, tenantId: number, page: number = 1, limit: number = 25, filters: TenderFilters = {}, sortOptions: TenderSortOptions = {}): Promise<{ data: Array<Partial<Tender>>, total: number, page: number, limit: number }> => {
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

      // Apply keyword search
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
          // Direct tender fields
          { short_name: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { number: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { type: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { notes: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { inquiry: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { survey: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { location_description: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { tool_requirements: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { other_comment: { [Op.iLike]: { [Op.any]: searchPatterns } } },
          // Related fields
          { '$customer.name$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$customer.address$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$customer.city$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$customer.zip_code$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$customer.tax_number$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$contact.name$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$contact.email$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
          { '$contact.phone_number$': { [Op.iLike]: { [Op.any]: searchPatterns } } },
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
        'startDate': 'startDate',
        'type': 'type',
        'createdOn': 'createdOn',
        'dueDate': 'dueDate',
        'status': 'status',
        'updatedOn': 'updatedOn',
        'shortName': 'short_name',
        'netAmount': 'netAmount',
        'totalAmount': 'totalAmount'
      };

      const dbField = fieldMapping[orderBy] || orderBy;
      const sortOrder = order.toUpperCase() as 'ASC' | 'DESC';
      const nulls = sortOrder === 'DESC' ? 'NULLS LAST' : 'NULLS FIRST';

      // Handle virtual fields that need special sorting
      let orderClause: any;
      if (orderBy === 'netAmount' || orderBy === 'totalAmount') {
        // For virtual fields, we need to sort by the calculated amount
        // This requires a more complex query with subqueries
        orderClause = [['updatedOn', sortOrder], ['id', 'DESC']]; // Fallback to updatedOn for now
      } else if (fieldMapping[orderBy]) {
        // Use mapped field if it exists
        orderClause = [[dbField, sortOrder], ['id', 'DESC']];
      } else {
        // Fallback to updatedOn for unknown fields
        context.logger.warn(`Unknown sort field: ${orderBy}, falling back to updatedOn`);
        orderClause = [['updatedOn', sortOrder], ['id', 'DESC']];
      }

      if (orderBy === 'startDate') {
        orderClause = [
          [
            context.models.sequelize.literal(
              `(CASE WHEN "TenderModel"."status" NOT IN ('final', 'ordered', 'sent')
                  THEN NULL
                  ELSE "TenderModel"."start_date"
                END) ${sortOrder} ${nulls}`
            )
          ],
          ['id', 'DESC']
        ];
      }

      // Define includes for queries
      const baseIncludes = [
        {
          model: context.models.Location,
          as: "location",
          attributes: [],
          required: false
        },
        {
          model: context.models.Task,
          as: "tasks",
          attributes: [],
          required: false
        },
        {
          model: context.models.Contact,
          as: "contact",
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
          model: context.models.TenderItem,
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
              model: context.models.TaskColumn,
              as: "column",
              where: {
                finished: false,
              },
              required: true
            },
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
            }
          ]
        },
        {
          model: context.models.Contact,
          as: "contact",
          attributes: ["name", "email"]
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
          model: context.models.TenderItem,
          as: "items",
          required: false,
          order: [["num", "ASC"]]
        }
      ];

      // Use a consistent approach for both count and data
      // First get all matching tender IDs to ensure consistency
      const allMatchingTenders = await context.models.Tender.findAll({
        where: whereClause,
        include: baseIncludes,
        attributes: ['id'],
        order: orderClause,
        subQuery: false
      });

      // Get unique tender IDs and total count
      const uniqueTenderIds = [...new Set(allMatchingTenders.map(t => t.id))];
      const total = uniqueTenderIds.length;

      // Apply pagination to the unique IDs
      const paginatedIds = uniqueTenderIds.slice(offset, offset + limit);

      // Get full data for the paginated IDs
      const data = await context.models.Tender.findAll({
        where: {
          id: { [Op.in]: paginatedIds },
          tenantId
        },
        include: fullIncludes as any,
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
      context.logger.error(error);

      if (error instanceof Error) {
        context.logger.error(error.stack);
      }
      throw error;
    }
  };

  const getBasicTenders = async (context: Context, tenantId: number): Promise<Array<Partial<Tender>>> => {
    try {
      return await context.models.Tender.findAll({
        where: { tenantId },
        attributes: ["id", "shortName", "number", "type", "status"],
        include: [
          {
            model: context.models.Company,
            as: "customer",
            attributes: ["id", "name"]
          }
        ],
        order: [["type", "DESC"]]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getTender = async (context: Context, tenantId: number, id: number): Promise<Partial<Tender> | null> => {
    try {
      return await context.models.Tender.findOne({
        where: { tenantId, id },
        include: [
          {
            model: context.models.Contact,
            as: "contact",
            attributes: ["name", "email"]
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
            model: context.models.TenderItem,
            as: "items",
            required: false,
          }
        ],
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const sendTenderViaEmail = async (context: Context, user: DecodedUser, id: number, message: string, content: Blob): Promise<{ success: boolean }> => {
    try {
      const tender = await context.models.Tender.findOne({
        where: { tenantId: user.tenant, id },
        attributes: ["id"]
      });

      if (!tender) {
        return { success: false };
      }

      const name = `tmp/${uuidv4()}.pdf`;
      await context.storage.uploadBlob(content, name, "application/pdf");

      await context.services.email.sendTenderPdfEmail(context, id, message, name);
      await tender.update({ status: TENDER_STATUS.SENT, updatedBy: user.id });

      await context.services.journey.addSimpleLog(context, user, {
        activity: "The tender have been successfully sent via email.",
        property: "status"
      }, tender.id, "tender");

      return { success: true };
    }
    catch (error: any) {
      context.logger.error(error);
      throw error;
    }
  }

  const getTenderItems = async (context: Context, tenantId: number, id: number): Promise<Partial<TenderItem>[]> => {
    try {
      return await context.models.TenderItem.findAll({
        where: { tenderId: id },
        order: [["num", "ASC"]],
        include: [
          {
            model: context.models.Tender,
            as: "tender",
            attributes: ["discount", "surcharge", "vatKey"],
            where: { tenantId },
            required: true,
          }
        ]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getItemsByTenderType = async (context: Context, tenantId: number, id: number): Promise<Partial<TenderItem>[]> => {
    try {
      const tender = await context.models.Tender.findOne({
        where: { tenantId, id },
        attributes: ["type"]
      });

      if (!tender) {
        return [];
      }

      return await context.models.TenderItem.findAll({
        attributes: ["id", "name"],
        order: [["num", "ASC"]],
        include: [
          {
            model: context.models.Tender,
            as: "tender",
            attributes: ["type"],
            where: { tenantId, type: tender.type },
            required: true,
          }
        ]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getTenderDocuments = async (context: Context, id: number): Promise<Partial<Document>[] | []> => {
    try {
      return await context.models.Document.findAll({
        where: { ownerId: id, ownerType: "tender" },
        attributes: ["id", "name", "stored", "mimeType"],
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getTenderDocument = async (context: Context, id: number, documentId: number): Promise<Partial<Document> | null> => {
    try {
      return await context.models.Document.findOne({
        where: { ownerId: id, ownerType: "tender", id: documentId },
        attributes: ["id", "mimeType", "name", "stored"],
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getTenderJourneys = async (context: Context, id: number): Promise<Partial<Journey>[] | []> => {
    try {
      return await context.services.journey.getLogs(context, id, "tender");
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const uploadTenderDocuments = async (context: Context, id: number, user: DecodedUser, documents: CreateDocumentProperties[]): Promise<{ uploaded: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      for (const document of documents) {
        await context.models.Document.create({
          ...document, ownerId: id, ownerType: "tender"
        }, { transaction: t });

        await context.services.journey.addSimpleLog(context, user, {
          activity: `Document have been successfully uploaded.`,
          property: `Document`,
          updated: document.name
        }, id, "tender", t);
      };

      await t.commit();
      return { uploaded: true };
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  }

  const removeAllTenderDocuments = async (context: Context, id: number, user: DecodedUser, type: string): Promise<{ success: boolean }> => {
    try {
      const documents = await context.models.Document.findAll({
        attributes: ["name", "id", "type"],
        where: { ownerId: id, ownerType: "tender", type }
      });

      for (const document of documents) {
        await context.services.journey.addSimpleLog(context, user, {
          activity: `Document have been successfully removed.`,
          property: `Documents`,
          updated: document.name
        }, id, "tender");

        await document.destroy();
      }

      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const removeTenderDocument = async (context: Context, id: number, user: DecodedUser, documentId: number): Promise<{ success: boolean }> => {
    try {
      const document = await context.models.Document.findOne({
        attributes: ["name", "id", "type"],
        where: { id: documentId, ownerId: id, ownerType: "tender" }
      });

      if (document) {
        await context.services.journey.addSimpleLog(context, user, {
          activity: `Document have been successfully removed.`,
          property: `Document`,
          updated: document.name
        }, id, "tender");

        await document.destroy();
      }

      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const createTender = async (context: Context, tenantId: number, user: DecodedUser, data: CreateTenderProperties): Promise<Partial<Tender> | null> => {
    try {
      const createdOn = data.createdOn ? new Date(data.createdOn) : new Date();
      const tender = await context.models.Tender.create({ ...data, tenantId, createdBy: user.id, createdOn });

      await context.services.journey.addSimpleLog(context, user, {
        activity: "The tender have been successfully created.",
      }, tender.id, "tender");

      return tender;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const copyTender = async (context: Context, user: DecodedUser, tenderId: number): Promise<Partial<Tender> | null> => {
    const t = await context.models.sequelize.transaction();

    try {
      const tender = await context.models.Tender.findOne({
        where: { id: tenderId, tenantId: user.tenant }
      });

      if (!tender) {
        return null;
      }

      const { createdOn, updatedOn, createdBy, updatedBy, id, validTo, startDate, dueDate, openDate, number, ...data } = tender.toJSON();

      const newTender = await context.models.Tender.create({
        ...data,
        number: null,
        createdBy: user.id,
        status: TENDER_STATUS.INQUIRY
      }, { transaction: t });

      await copyTenderItem(context, tenderId, newTender.id, user, t);
      await context.services.journey.addSimpleLog(context, user, {
        activity: "The tender have been successfully copied.",
      }, tenderId, "tender", t);

      await t.commit();
      return newTender;
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  const updateTender = async (context: Context, id: number, user: DecodedUser, data: Partial<Tender>): Promise<{ statusChanged: boolean, status?: string, tender: Partial<Tender> | null }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const tender = await context.models.Tender.findByPk(id);
      if (!tender) {
        return { statusChanged: false, tender: null };
      }

      const statusChanged = (data.status && tender.status !== data.status) ?? false;
      const [num, updated] = await context.models.Tender.update(
        {
          ...data,
          updatedBy: user.id
        },
        {
          where: { id },
          transaction: t,
          returning: true
        }
      );

      if (num === 0 || !updated[0]) {
        throw new Error("Tender update failed.");
      }

      const updatedTender = updated[0];
      const tenderNumber = await generateTenderNumber(context, user, updatedTender);
      if (tenderNumber) {
        try {
          await updatedTender.update({ number: tenderNumber, updatedBy: user.id }, { transaction: t });
        } catch (error: any) {
          // Handle unique constraint violation
          if (error.name === 'SequelizeUniqueConstraintError' && error.fields?.includes('number')) {
            context.logger.warn(`Tender number ${tenderNumber} already exists, skipping number assignment`);
            // Continue without updating the number - the tender will remain without a number
          } else {
            throw error;
          }
        }
      }

      if (data.vatKey || data.surcharge || data.discount) {
        const surcharge = data.surcharge || tender.surcharge;
        const discount = data.discount || tender.discount;
        const vatKey = data.vatKey || tender.vatKey;

        const items = await context.models.TenderItem.findAll({
          where: { tenderId: id }
        });

        for (const item of items) {
          await item.update({
            ...calculateTenderItemAmounts(item, surcharge!, discount!, vatKey),
            updatedBy: user.id
          }, { transaction: t });
        }
      }

      await context.services.journey.addDiffLogs<Partial<Tender>>(context, user, {
        activity: "The tender has been successfully updated.",
        existed: tender,
        updated: data
      }, tender.id, "tender", t);

      // Sync startDate and endDate to related project if exists
      if (data.startDate !== undefined || data.endDate !== undefined) {
        const project = await context.models.Project.findOne({
          where: { tenderId: id }
        });

        if (project) {
          const projectUpdateData: any = {};
          if (data.startDate !== undefined) {
            projectUpdateData.startDate = data.startDate;
          }
          if (data.endDate !== undefined) {
            projectUpdateData.endDate = data.endDate;
          }

          if (Object.keys(projectUpdateData).length > 0) {
            projectUpdateData.updatedBy = user.id;
            await project.update(projectUpdateData, { transaction: t });

            await context.services.journey.addSimpleLog(context, user, {
              activity: "Project dates synced from tender.",
            }, project.id, "project", t);
          }
        }
      }

      await t.commit();

      return {
        statusChanged,
        status: tender.status,
        tender: updatedTender.toJSON() as Partial<Tender>
      }
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  };

  const deleteTender = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    try {
      await context.models.Tender.destroy({ where: { id, tenantId }, force: true });

      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteTenders = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    try {
      await context.models.Tender.destroy({ where: { id: { [Op.in]: body.ids }, tenantId }, force: true });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const createTenderItem = async (context: Context, tenderId: number, user: DecodedUser, data: CreateTenderItemProperties): Promise<TenderItem> => {
    try {
      const numMax: number | null = await context.models.TenderItem.max("num", { where: { tenderId } });
      const max = numMax ? Number(numMax) + 1 : 1;

      await context.services.journey.addSimpleLog(context, user, {
        activity: "The tender item have been successfully created.",
      }, tenderId, "tender");

      const tenderItem = await context.models.TenderItem.create({
        ...data,
        tenderId,
        createdBy: user.id,
        num: max
      } as TenderItem);

      // Sync to search table
      try {
        await context.services.tenderItemsSearch.syncTenderItem(context, tenderItem.id);
      } catch (syncError) {
        context.logger.warn(`Failed to sync tender item ${tenderItem.id} to search table:`, syncError);
      }

      return tenderItem;

    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const updateTenderItem = async (context: Context, tenderId: number, id: number, user: DecodedUser, data: Partial<TenderItem>): Promise<Partial<TenderItem> | null> => {
    try {
      const tenderItem = await context.models.TenderItem.findOne({
        where: { id, tenderId }
      });

      if (!tenderItem) {
        return null;
      }

      await context.services.journey.addDiffLogs(context, user, {
        activity: "The tender item have been successfully updated.",
        existed: tenderItem,
        updated: data
      }, tenderId, "tender");

      await tenderItem.update({ ...data, updatedBy: user.id });

      // Sync to search table
      try {
        await context.services.tenderItemsSearch.syncTenderItem(context, tenderItem.id);
      } catch (syncError) {
        context.logger.warn(`Failed to sync tender item ${tenderItem.id} to search table:`, syncError);
      }

      return tenderItem;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const updateTenderItemOrder = async (context: Context, tenderId: number, id: number, user: DecodedUser, data: { side: "up" | "down" }): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const tenderItem = await context.models.TenderItem.findOne({
        where: { id, tenderId }
      });

      if (!tenderItem) {
        return { success: false };
      }

      const num = data.side === "up" ? tenderItem.num - 1 : tenderItem.num + 1;
      const tenderNumed = await context.models.TenderItem.findOne({
        where: { tenderId, num }
      });

      await tenderItem.update({
        ...data, updatedBy: user.id, num: data.side === "up" ? tenderItem.num - 1 : tenderItem.num + 1
      }, { transaction: t });

      await tenderNumed?.update(
        {
          num: data.side === "up" ? tenderNumed.num + 1 : tenderNumed.num - 1,
          updatedBy: user.id
        }
      ), { transaction: t };

      await context.services.journey.addSimpleLog(context, user, {
        activity: "The tender item have been successfully reordered.",
      }, tenderId, "tender", t);

      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const renumberTenderItems = async (context: Context, tenderId: number) => {
    const items = await context.models.TenderItem.findAll({
      where: { tenderId },
      order: [["num", 'ASC']],
    });

    for (let i = 0; i < items.length; i++) {
      await items[i].update({ num: i + 1 });
    }
  }

  const removeTenderItem = async (context: Context, user: DecodedUser, tenderId: number, id: number): Promise<{ success: boolean }> => {
    try {
      await context.models.TenderItem.destroy({ where: { id, tenderId } });
      await renumberTenderItems(context, tenderId);

      // Remove from search table
      try {
        await context.services.tenderItemsSearch.deleteTenderItem(context, id);
      } catch (syncError) {
        context.logger.warn(`Failed to remove tender item ${id} from search table:`, syncError);
      }

      await context.services.journey.addSimpleLog(context, user, {
        activity: "The tender item have been successfully removed.",
      }, tenderId, "tender");

      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const copyTenderItem = async (context: Context, sourceId: number, targetId: number, user: DecodedUser, transaction?: Transaction): Promise<{ success: boolean }> => {
    const t = !transaction ? await context.models.sequelize.transaction() : transaction;

    try {
      const sourceItems = await context.models.TenderItem.findAll({
        where: { tenderId: sourceId }
      });

      const numOfItems = await context.models.TenderItem.count({ where: { tenderId: targetId } });

      for (let i = 0; i < sourceItems.length; i++) {
        const item = sourceItems[i];
        const { id, tenderId, createdBy, createdOn, updatedOn, updatedBy, ...otherData } = item.toJSON();
        const num = numOfItems === 0 ? item.num : numOfItems + i + 1;

        const data = { ...otherData, tenderId: targetId, createdBy: user.id, num };
        await context.models.TenderItem.create(data, { transaction: t });
      }

      if (!transaction) {
        await t.commit();
      }

      await context.services.journey.addSimpleLog(context, user, {
        activity: "The tender items have been successfully copied.",
      }, targetId, "tender");

      return { success: true };
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }

      context.logger.error(error);
      throw error;
    }
  }

  const findDuplicateTenderNumbers = async (context: Context, tenantId: number): Promise<Array<{ number: string; count: number; tenderIds: number[] }>> => {
    try {
      return await TenderDuplicateCleanup.findDuplicates(context, tenantId);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const cleanupDuplicateTenderNumbers = async (context: Context, tenantId: number): Promise<{ cleaned: number; duplicates: Array<{ number: string; count: number; tenderIds: number[] }> }> => {
    try {
      return await TenderDuplicateCleanup.cleanupDuplicates(context, tenantId);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getTenderNumberStats = async (context: Context, tenantId: number): Promise<{ totalTenders: number; tendersWithNumbers: number; uniqueNumbers: number; duplicates: number }> => {
    try {
      return await TenderDuplicateCleanup.getTenderNumberStats(context, tenantId);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getTenderStatusCounts = async (context: Context, tenantId: number): Promise<Record<string, number>> => {
    try {
      const counts = await context.models.Tender.findAll({
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

  const updateTenderDateRange = async (context: Context, id: number, user: DecodedUser, data: { startDate: string | null, endDate: string | null }): Promise<{ success: boolean }> => {
    try {
      await context.models.Tender.update(
        {
          startDate: !data.startDate ? context.models.sequelize.literal("NULL") : new Date(data.startDate),
          endDate: !data.endDate ? context.models.sequelize.literal("NULL") : new Date(data.endDate),
          updatedBy: user.id
        },
        { where: { id, tenantId: user.tenant }, logging: console.log }
      );

      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    getTenders,
    getBasicTenders,
    getTender,
    getTenderDocuments,
    uploadTenderDocuments,
    removeAllTenderDocuments,
    removeTenderDocument,
    getTenderDocument,
    createTender,
    updateTender,
    deleteTender,
    deleteTenders,
    getTenderJourneys,
    getTenderItems,
    updateTenderItemOrder,
    createTenderItem,
    updateTenderItem,
    removeTenderItem,
    copyTenderItem,
    copyTender,
    sendTenderViaEmail,
    getItemsByTenderType,
    findDuplicateTenderNumbers,
    cleanupDuplicateTenderNumbers,
    getTenderNumberStats,
    getTenderStatusCounts,
    updateTenderDateRange
  }
};
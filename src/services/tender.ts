import { Op, Transaction } from "sequelize";
import type { Context, DecodedUser } from "../types";
import type { CreateTenderProperties, Tender } from "../models/interfaces/tender";
import { CreateDocumentProperties, Document } from "../models/interfaces/document";
import { Journey } from "../models/interfaces/journey";
import { CreateTenderItemProperties, TenderItem } from "../models/interfaces/tender-item";
import { TENDER_STATUS } from "../constants";

export interface TenderService {
  getTenders: (context: Context, tenantId: number) => Promise<Array<Partial<Tender>>>
  getTender: (context: Context, tenantId: number, id: number) => Promise<Partial<Tender> | null>
  getTenderDocuments: (context: Context, id: number) => Promise<Partial<Document>[] | []>
  sendTenderViaEmail: (context: Context, user: DecodedUser, id: number, message: string) => Promise<{ success: boolean }>
  removeAllTenderDocuments: (context: Context, id: number, user: DecodedUser, type: string) => Promise<{ success: boolean }>
  removeTenderDocument: (context: Context, id: number, user: DecodedUser, documentId: number) => Promise<{ success: boolean }>
  getTenderDocument: (context: Context, id: number, documentId: number) => Promise<Partial<Document> | null>
  createTender: (context: Context, tenantId: number, user: DecodedUser, data: CreateTenderProperties) => Promise<Partial<Tender> | null>
  uploadTenderDocuments: (context: Context, id: number, user: DecodedUser, documents: CreateDocumentProperties[]) => Promise<{ uploaded: boolean }>
  updateTender: (context: Context, id: number, user: DecodedUser, data: Partial<Tender>) => Promise<{ statusChanged: boolean, tender: Partial<Tender> | null, status?: string }>
  deleteTender: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteTenders: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
  getTenderJourneys: (context: Context, id: number) => Promise<Partial<Journey>[] | []>
  getTenderItems: (context: Context, tenantId: number, id: number) => Promise<Partial<TenderItem>[]>
  createTenderItem: (context: Context, tenderId: number, user: DecodedUser, data: CreateTenderItemProperties) => Promise<TenderItem>
  updateTenderItem: (context: Context, tenderId: number, id: number, user: DecodedUser, data: Partial<TenderItem>) => Promise<Partial<TenderItem> | null>
  removeTenderItem: (context: Context, tenderId: number, id: number) => Promise<{ success: boolean }>
  copyTender: (context: Context, user: DecodedUser, id: number) => Promise<Partial<Tender> | null>
  copyTenderItem: (context: Context, tenderId: number, sourceTenderId: number, user: DecodedUser) => Promise<{ success: boolean }>
};

export const tenderService = (): TenderService => {
  const generateTenderNumber = async (context: Context, tender: Tender): Promise<string | null> => {
    if (tender.number && tender.number.length > 0) {
      return tender.number;
    }

    if ([TENDER_STATUS.SENT, TENDER_STATUS.FINALIZED, TENDER_STATUS.ORDERED].includes(tender.status) && tender.contractorId) {
      const year = new Date().getFullYear();

      const constructor = await context.models.Company.findOne({
        attributes: ["offerNum"],
        where: { id: tender.contractorId!, type: "contractor", },
      });

      if (!constructor) {
        return null;
      }

      const tenderNum = await context.models.Tender.count({
        where: {
          contractorId: tender.contractorId,
          number: {
            [Op.not]: null,
            [Op.ne]: "",
          },
          createdOn: {
            [Op.gte]: new Date(`${year}-01-01`),
            [Op.lte]: new Date(`${year}-12-31`)
          }
        }
      });

      return `${constructor.offerNum}-${year}-${tenderNum + 1}`;
    }

    return null;
  }

  const getTenders = async (context: Context, tenantId: number): Promise<Array<Partial<Tender>>> => {
    try {
      return await context.models.Tender.findAll({
        attributes: ["id", "type", "status", "dueDate", "createdOn", "number", "fee", "returned", "currency", "discount", "surcharge", "vatKey"],
        include: [
          {
            model: context.models.Contact,
            as: "contact",
            attributes: ["name"]
          },
          {
            model: context.models.Location,
            as: "location",
            attributes: ["id", "name", "city", "country", "zipCode", "address"]
          },
          {
            model: context.models.Company,
            as: "customer",
            attributes: ["id", "name"]
          },
          {
            model: context.models.Company,
            as: "contractor",
            attributes: ["id", "name", "prefix"]
          },
          {
            model: context.models.TenderItem,
            as: "items",
            required: false
          }
        ],
        where: { tenantId },
        order: [["createdOn", "DESC"]]
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
            attributes: ["name"]
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
                as: "documents"
              }
            ]
          },
          {
            model: context.models.TenderItem,
            as: "items",
            required: false
          }
        ],
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const sendTenderViaEmail = async (context: Context, user: DecodedUser, id: number, message: string): Promise<{ success: boolean }> => {
    try {
      const tender = await context.models.Tender.findOne({
        where: { tenantId: user.tenant, id },
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
                as: "documents"
              }
            ]
          },
          {
            model: context.models.TenderItem,
            as: "items",
            required: false
          }
        ],
      });

      if (!tender || !tender.items) {
        return { success: false };
      }

      context.services.email.sendTenderPdfEmail(context, tender, message);
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
        include: [
          {
            model: context.models.Tender,
            as: "tender",
            attributes: ["id"],
            where: { tenantId },
            required: true
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
        attributes: ["id", "name", "type", "size", "preview", "mimeType"],
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
        attributes: ["id", "data", "mimeType", "name"],
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const getTenderJourneys = async (context: Context, id: number): Promise<Partial<Journey>[] | []> => {
    try {
      return await context.services.journey.getLogs(context, id);
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
          activity: `The tender ${document.type} document have been successfully uploaded.`,
          property: `${document.type} documents`,
          updated: document.name
        }, id, "tender");
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
          activity: `The tender ${type} document have been successfully removed.`,
          property: `${type} documents`,
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
          activity: `The tender ${document.type} document have been successfully removed.`,
          property: `${document.type} documents`,
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
      const tender = await context.models.Tender.create({ ...data, tenantId, createdBy: user.id });
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

      const { createdOn, updatedOn, createdBy, updatedBy, id, validTo, startDate, dueDate, openDate, ...data } = tender.toJSON();
      const newTender = await context.models.Tender.create({
        ...data,
        createdBy: user.id,
        status: TENDER_STATUS.INQUIRY
      }, { transaction: t });

      await copyTenderItem(context, tenderId, newTender.id, user, t);
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
      const tenderNumber = await generateTenderNumber(context, updatedTender);
      if (tenderNumber) {
        await updatedTender.update({ number: tenderNumber, updatedBy: user.id }, { transaction: t });
      }

      await context.services.journey.addDiffLogs(context, user, {
        activity: "The tender has been successfully updated.",
        existed: tender.toJSON(),
        updated: updatedTender.toJSON()
      }, tender.id, "tender", t);

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
      return await context.models.TenderItem.create({ ...data, tenderId, createdBy: user.id });
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

      await tenderItem.update({ ...data, updatedBy: user.id });
      return tenderItem;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const removeTenderItem = async (context: Context, tenderId: number, id: number): Promise<{ success: boolean }> => {
    try {
      await context.models.TenderItem.destroy({ where: { id, tenderId } })
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  const copyTenderItem = async (context: Context, tenderId: number, targetTenderId: number, user: DecodedUser, transaction?: Transaction): Promise<{ success: boolean }> => {
    const t = !transaction ? await context.models.sequelize.transaction() : transaction;

    try {
      const tenderItems = await context.models.TenderItem.findAll({
        where: { tenderId }
      });

      for (const item of tenderItems) {
        const { id, tenderId, createdBy, createdOn, updatedOn, updatedBy, ...data } = item.toJSON();

        await context.models.TenderItem.create({
          ...data, tenderId: targetTenderId, createdBy: user.id,
        }, { transaction: t });
      }

      if (!transaction) {
        await t.commit();
      }

      return { success: true };
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }

      context.logger.error(error);
      throw error;
    }
  }

  return {
    getTenders,
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
    createTenderItem,
    updateTenderItem,
    removeTenderItem,
    copyTenderItem,
    copyTender,
    sendTenderViaEmail
  }
};
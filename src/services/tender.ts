import { Op, Transaction, QueryTypes, Sequelize } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
import type { Context, DecodedUser } from "../types";
import type { CreateTenderProperties, Tender } from "../models/interfaces/tender";
import { CreateDocumentProperties, Document } from "../models/interfaces/document";
import { Journey } from "../models/interfaces/journey";
import { CreateTenderItemProperties, TenderItem } from "../models/interfaces/tender-item";
import { TENDER_STATUS } from "../constants";
import { calculateTenderItemAmounts } from "../helpers/tender";

export interface TenderService {
  getTenders: (context: Context, tenantId: number) => Promise<Array<Partial<Tender>>>
  getTender: (context: Context, tenantId: number, id: number) => Promise<Partial<Tender> | null>
  getTenderDocuments: (context: Context, id: number) => Promise<Partial<Document>[] | []>
  sendTenderViaEmail: (context: Context, user: DecodedUser, id: number, message: string, content: Blob) => Promise<{ success: boolean }>
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
  removeTenderItem: (context: Context, user: DecodedUser, tenderId: number, id: number) => Promise<{ success: boolean }>
  updateTenderItemOrder: (context: Context, tenderId: number, id: number, user: DecodedUser, data: { side: "up" | "down" }) => Promise<{ success: boolean }>
  copyTender: (context: Context, user: DecodedUser, id: number) => Promise<Partial<Tender> | null>
  copyTenderItem: (context: Context, sourceId: number, targetId: number, user: DecodedUser) => Promise<{ success: boolean }>
};

const ALLOWED_STATUSES = [TENDER_STATUS.SENT, TENDER_STATUS.FINALIZED, TENDER_STATUS.ORDERED];

export const tenderService = (): TenderService => {
  const nextTenderSeq = async (sequelize: Sequelize, { tenantId, contractorId, year }: { tenantId: number, contractorId: number, year: number }): Promise<string> => {
    const t = await sequelize.transaction();

    try {
      await sequelize.query(
        `
    INSERT INTO tender_number_counters (tenant_id, contractor_id, year, seq)
    VALUES (:tenantId, :contractorId, :year, 0)
    ON CONFLICT (tenant_id, contractor_id, year) DO NOTHING
    `,
        { type: QueryTypes.INSERT, transaction: t, replacements: { tenantId, contractorId, year } }
      );

      await sequelize.query(
        `
    UPDATE tender_number_counters
    SET seq = seq + 1, updated_at = NOW()
    WHERE tenant_id = :tenantId AND contractor_id = :contractorId AND year = :year
    `,
        { type: QueryTypes.UPDATE, transaction: t, replacements: { tenantId, contractorId, year } }
      );

      await t.commit();

      const [result] = await sequelize.query(
        `SELECT seq FROM tender_number_counters WHERE tenant_id = :tenantId AND contractor_id = :contractorId AND year = :year`,
        { type: QueryTypes.SELECT, replacements: { tenantId, contractorId, year } }
      );

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
    const seq = await nextTenderSeq(sequelize, { tenantId: tenantId!, contractorId, year });

    const number = `${contractor.offerNum}-${year}-${seq}`;

    await context.services.journey.addSimpleLog(
      context, user,
      { activity: 'The tender number has been successfully generated.', property: 'number', updated: number },
      tender.id, 'tender'
    );

    return number;
  }

  const getTenders = async (context: Context, tenantId: number): Promise<Array<Partial<Tender>>> => {
    try {
      return await context.models.Tender.findAll({
        include: [
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
        ],
        where: { tenantId },
        order: [["updatedOn", "DESC"]]
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
            order: [["num", "ASC"]]
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
        await updatedTender.update({ number: tenderNumber, updatedBy: user.id }, { transaction: t });
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

      return await context.models.TenderItem.create({
        ...data,
        tenderId,
        createdBy: user.id,
        num: max
      } as TenderItem);

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
    updateTenderItemOrder,
    createTenderItem,
    updateTenderItem,
    removeTenderItem,
    copyTenderItem,
    copyTender,
    sendTenderViaEmail
  }
};
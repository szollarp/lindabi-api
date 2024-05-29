import { Op } from "sequelize";
import type { Context } from "../types";
import type { Tender } from "../models/interfaces/tender";

export interface TenderService {
  getTenders: (context: Context, tenantId: number) => Promise<Array<Partial<Tender>>>
  getTender: (context: Context, tenantId: number, id: number) => Promise<Partial<Tender> | null>
  deleteTender: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteTenders: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
};

export const tenderService = (): TenderService => {
  const getTenders = async (context: Context, tenantId: number): Promise<Array<Partial<Tender>>> => {
    return await context.models.Tender.findAll({
      attributes: ["id", "type", "status", "dueDate"],
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
          attributes: ["id", "name"]
        },
        {
          model: context.models.Company,
          as: "contractor",
          attributes: ["id", "prefix"]
        },
        {
          model: context.models.TenderItem,
          attributes: ["id", "totalAmount"],
          as: "items"
        }
      ],
      where: { tenantId }
    });
  };

  const getTender = async (context: Context, tenantId: number, id: number): Promise<Partial<Tender> | null> => {
    return await context.models.Tender.findOne({
      attributes: ["id", "type", "status", "dueDate"],
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
          attributes: ["id", "name"]
        },
        {
          model: context.models.Company,
          as: "contractor",
          attributes: ["id", "prefix"]
        },
        {
          model: context.models.TenderItem,
          attributes: ["id", "totalAmount"],
          as: "items"
        }
      ],
    });
  };

  const deleteTender = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    await context.models.Tender.destroy({ where: { id, tenantId }, transaction: t, force: true });
    await t.commit();

    return { success: true };
  };

  const deleteTenders = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    await context.models.Tender.destroy({ where: { id: { [Op.in]: body.ids }, tenantId }, transaction: t, force: true });
    await t.commit();

    return { success: true };
  };

  return {
    getTenders,
    getTender,
    deleteTender,
    deleteTenders
  }
};
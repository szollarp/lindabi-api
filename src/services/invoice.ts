import { Op } from "sequelize";
import { Context, DecodedUser } from "../types";
import { INVOICE_STATUS } from "../constants";
import { CreateInvoiceProperties, Invoice } from "../models/interfaces/invoice";

export interface InvoiceService {
  create: (context: Context, user: DecodedUser, data: CreateInvoiceProperties) => Promise<Invoice>
  update: (context: Context, user: DecodedUser, id: number, data: Partial<Invoice>) => Promise<Invoice>
  get: (context: Context, user: DecodedUser, id: number) => Promise<Invoice | null>
  list: (context: Context, user: DecodedUser) => Promise<Invoice[]>
  remove: (context: Context, user: DecodedUser, id: number) => Promise<{ success: boolean }>
}

export const invoiceService = (): InvoiceService => {
  return { create, update, list, get, remove };
};

const create = async (context: Context, user: DecodedUser, data: CreateInvoiceProperties): Promise<Invoice> => {
  try {
    return await context.models.Invoice.create({
      ...data,
      status: INVOICE_STATUS.CREATED,
      createdBy: user.id,
      tenantId: user.tenant
    } as Invoice);
  } catch (error) {
    throw error;
  }
};

const update = async (context: Context, user: DecodedUser, id: number, data: Partial<Invoice>): Promise<Invoice> => {
  try {
    const invoice = await context.models.Invoice.findByPk(id);
    if (!invoice) throw new Error("Invoice certificate not found");

    return await invoice.update({
      ...data,
      updatedBy: user.id
    });
  } catch (error) {
    throw error;
  }
};

const list = async (context: Context, user: DecodedUser): Promise<Invoice[]> => {
  try {
    const where = (user.isSystemAdmin || (user.isManager && user.permissions!.includes("Invoice:List"))) ? { tenant: user.tenant } : {
      tenant: user.tenant,
      [Op.or]: [
        { "$employee.id$": user.id },
        { createdBy: user.id }
      ]
    };

    return await context.models.Invoice.findAll({
      where,
      attributes: ["id", "invoiceNumber"]
    });
  } catch (error) {
    throw error;
  }
};

const get = async (context: Context, user: DecodedUser, id: number): Promise<Invoice | null> => {
  try {
    return await context.models.Invoice.findOne({
      where: { id, tenant: user.tenant },
      attributes: ["id", "invoiceNumber"]
    });
  } catch (error) {
    throw error;
  }
};

const remove = async (context: Context, user: DecodedUser, id: number): Promise<{ success: boolean }> => {
  try {
    const invoice = await context.models.Invoice.findOne({ where: { id, tenant: user.tenant } });
    if (!invoice) throw new Error("Completion certificate not found");

    await invoice.destroy();
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
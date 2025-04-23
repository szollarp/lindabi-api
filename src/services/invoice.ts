import { Op } from "sequelize";
import { Context, DecodedUser } from "../types";
import { COMPLETION_CERTIFICATE_STATUS, INVOICE_STATUS } from "../constants";
import { CreateInvoiceProperties, Invoice } from "../models/interfaces/invoice";
import { CompletionCertificate } from "../models/interfaces/completion-certificate";
import { CreateFinancialTransactionProperties } from "../models/interfaces/financial-transaction";

export interface InvoiceService {
  create: (context: Context, user: DecodedUser, data: CreateInvoiceProperties) => Promise<Invoice>
  update: (context: Context, user: DecodedUser, id: number, data: Partial<Invoice>) => Promise<Invoice>
  get: (context: Context, user: DecodedUser, id: number) => Promise<Invoice | null>
  list: (context: Context, user: DecodedUser) => Promise<Invoice[]>
  remove: (context: Context, user: DecodedUser, id: number) => Promise<{ success: boolean }>
  getPossibleCompletionCertificate: (context: Context, user: DecodedUser, projectId: number, employeeId: number) => Promise<CompletionCertificate[]>
}

export const invoiceService = (): InvoiceService => {
  return { create, update, list, get, remove, getPossibleCompletionCertificate };
};

const create = async (context: Context, user: DecodedUser, data: CreateInvoiceProperties): Promise<Invoice> => {
  try {
    const existingInvoice = await context.models.Invoice.findOne({
      attributes: ["id"],
      where: {
        invoiceNumber: data.invoiceNumber,
        tenantId: user.tenant
      }
    });

    if (existingInvoice) {
      throw new Error("Invoice with this number already exists");
    }

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
  const t = await context.models.sequelize.transaction();

  try {
    const invoice = await context.models.Invoice.findByPk(id);
    if (!invoice) throw new Error("Invoice certificate not found");

    if (data.status === INVOICE_STATUS.APPROVED && !invoice.approvedBy) {
      data.approvedBy = user.id;
      data.approvedOn = new Date();
    }

    if (data.status === INVOICE_STATUS.PAYED && invoice.pattyCash !== data.pattyCash) {
      const pattyCashInput = data.pattyCash == true ?
        {
          payerId: invoice.employeeId,
          payerType: "employee",
          recipientType: "cash desk",
        } : {
          payerType: "cash desk",
          recipientType: "employee",
          recipientId: invoice.employeeId
        }

      const project = await context.models.Project.findByPk(invoice.projectId);

      await context.models.FinancialTransaction.create({
        date: invoice.payedOn || new Date(),
        amount: invoice.netAmount,
        contractorId: project!.contractorId,
        description: invoice.invoiceNumber,
        createdBy: user.id,
        tenantId: user.tenant,
        ...pattyCashInput
      } as CreateFinancialTransactionProperties), { transaction: t };
    }

    const updated = await invoice.update({
      ...data,
      updatedBy: user.id
    }, { transaction: t });

    await t.commit();

    return updated;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const list = async (context: Context, user: DecodedUser): Promise<Invoice[]> => {
  try {
    const where = (user.isSystemAdmin || (user.isManager && user.permissions!.includes("Invoice:List"))) ? { tenantId: user.tenant } : {
      tenantId: user.tenant,
      [Op.or]: [
        { "$employee.id$": user.id },
        { "$creator.id$": user.id }
      ]
    };

    return await context.models.Invoice.findAll({
      where,
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
    throw error;
  }
};

const get = async (context: Context, user: DecodedUser, id: number): Promise<Invoice | null> => {
  const where = (user.isSystemAdmin || (user.isManager && user.permissions!.includes("Invoice:List"))) ? { id, tenantId: user.tenant } : {
    id,
    tenantId: user.tenant,
    [Op.or]: [
      { "$employee.id$": user.id },
      { "$creator.id$": user.id }
    ]
  };

  try {
    return await context.models.Invoice.findOne({
      where,
      include: [{
        model: context.models.Document,
        as: "documents"
      }, {
        model: context.models.User,
        attributes: ["id", "name"],
        as: "approver"
      }, {
        model: context.models.User,
        attributes: ["id", "name"],
        as: "creator"
      }, {
        model: context.models.User,
        attributes: ["id"],
        as: "employee"
      }]
    });
  } catch (error) {
    throw error;
  }
};

const remove = async (context: Context, user: DecodedUser, id: number): Promise<{ success: boolean }> => {
  try {
    const invoice = await context.models.Invoice.findOne({ where: { id, tenantId: user.tenant } });
    if (!invoice) throw new Error("Completion certificate not found");

    await invoice.destroy();
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

const getPossibleCompletionCertificate = async (context: Context, user: DecodedUser, projectId: number, employeeId: number): Promise<CompletionCertificate[]> => {
  try {
    return await context.models.CompletionCertificate.findAll({
      attributes: ["id", "approvedOn", "amount"],
      where: {
        projectId,
        employeeId,
        status: COMPLETION_CERTIFICATE_STATUS.SIGNED,
        tenantId: user.tenant
      }
    });
  } catch (error) {
    throw error;
  }
};
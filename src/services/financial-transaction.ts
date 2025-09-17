import { Context, DecodedUser } from "../types";
import { CreateFinancialTransactionProperties, FinancialTransaction } from "../models/interfaces/financial-transaction";
import { Op } from "sequelize";

export interface FinancialTransactionService {
  getFinancialTransactions: (context: Context, user: DecodedUser) => Promise<FinancialTransaction[]>
  createFinancialTransactions: (context: Context, tenantId: number, createdBy: number, body: CreateFinancialTransactionProperties) => Promise<Partial<FinancialTransaction> | null>
}

export const financialTransactionService = (): FinancialTransactionService => ({
  getFinancialTransactions, createFinancialTransactions
});

const getFinancialTransactions = async (context: Context, user: DecodedUser): Promise<FinancialTransaction[]> => {
  try {
    const where = (user.isSystemAdmin || (user.isManager && user.permissions!.includes("PettyCash:List"))) ? { tenantId: user.tenant } : {
      [Op.or]: [
        { payerId: user.id },
        { recipientId: user.id }
      ],
      tenantId: user.tenant
    };

    return await context.models.FinancialTransaction.findAll({
      where,
      order: [["date", "DESC"]],
      attributes: ["id", "date", "amount", "description", "type", "showOnPayroll", "payerType", "recipientType", "createdOn"],
      include: [{
        model: context.models.User,
        as: "payer",
        attributes: ["id", "name"],
      }, {
        model: context.models.User,
        as: "recipient",
        attributes: ["id", "name"],
      }, {
        model: context.models.Company,
        as: "contractor",
        attributes: ["id", "name"],
      }, {
        model: context.models.User,
        as: "creator",
        attributes: ["id", "name"],
      }, {
        model: context.models.Invoice,
        as: "invoice",
        attributes: ["id", "invoiceNumber"],
      }]
    });
  } catch (error) {
    throw error;
  }
};

const createFinancialTransactions = async (context: Context, tenantId: number, createdBy: number, body: CreateFinancialTransactionProperties): Promise<Partial<FinancialTransaction> | null> => {
  try {
    return await context.models.FinancialTransaction.create({ ...body, tenantId, createdBy });
  } catch (error) {
    throw error;
  }
};
import { Op } from "sequelize";
import type { Context } from "../types";
import type { Company, CreateCompanyProperties } from "../models/interfaces/company";
import { COMPANY_TYPE } from "../constants";

export interface CompanyService {
  getCompanies: (context: Context, tenantId: number, type: COMPANY_TYPE.CONTRACTOR | COMPANY_TYPE.CUSTOMER) => Promise<Array<Partial<Company>>>
  getCompany: (context: Context, tenantId: number, id: number) => Promise<Partial<Company> | null>
  createCompany: (context: Context, tenantId: number, createdBy: number, body: CreateCompanyProperties) => Promise<Partial<Company> | null>
  updateCompany: (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Company>) => Promise<Partial<Company> | null>
  deleteCompany: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteCompanies: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
}

export const companyService = (): CompanyService => {
  const getCompanies = async (context: Context, tenantId: number, type: COMPANY_TYPE.CONTRACTOR | COMPANY_TYPE.CUSTOMER): Promise<Array<Partial<Company>>> => {
    try {
      return await context.models.Company.findAll({
        attributes: ["id", "name", "status", "taxNumber", "prefix", "notes", "city", "country", "address", "zipCode", "default"],
        where: { tenantId, type },
        include: [{
          model: context.models.Document,
          attributes: ["data", "mimeType", "type"],
          as: "documents",
          foreignKey: "ownerId"
        },
        {
          model: context.models.Location,
          attributes: ["id", "name", "country", "city", "address", "zipCode", "status"],
          as: "locations",
          through: { attributes: [] }
        }, {
          model: context.models.Contact,
          attributes: ["id", "name", "email", "phoneNumber", "status"],
          as: "contacts",
          through: { attributes: [] }
        }]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getCompany = async (context: Context, tenantId: number, id: number): Promise<Partial<Company> | null> => {
    try {
      return await context.models.Company.findOne({
        where: { tenantId, id },
        include: [{
          model: context.models.Document,
          attributes: ["data", "mimeType", "type"],
          as: "documents",
          foreignKey: "ownerId"
        }, {
          model: context.models.Location,
          attributes: ["id", "name", "country", "city", "address", "zipCode", "status"],
          as: "locations",
          through: { attributes: [] }
        }, {
          model: context.models.Contact,
          attributes: ["id", "name", "email", "phoneNumber", "status"],
          as: "contacts",
          through: { attributes: [] }
        }]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const createCompany = async (context: Context, tenantId: number, createdBy: number, data: CreateCompanyProperties): Promise<Partial<Company> | null> => {
    try {
      const company = await context.models.Company.create({ ...data, tenantId, createdBy });
      if (company) {
        if (company.type === COMPANY_TYPE.CONTRACTOR) {
          await context.services.notification.sendContractorCreatedNotification(context, company);
        }

        if (company.type === COMPANY_TYPE.CUSTOMER) {
          await context.services.notification.sendCustomerCreatedNotification(context, company);
        }
      }

      return company;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const updateCompany = async (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Company>): Promise<Partial<Company> | null> => {
    try {
      const company = await context.models.Company.findOne({
        where: { tenantId, id }
      });

      if (!company) {
        return null;
      }

      await company.update({ ...data, updatedBy });

      if (data.default === true) {
        await context.models.Company.update({ default: false }, { where: { tenantId, id: { [Op.ne]: id } } });
      }

      if (company.type === COMPANY_TYPE.CONTRACTOR) {
        await context.services.notification.sendContractorUpdateNotification(context, company);
      }

      if (company.type === COMPANY_TYPE.CUSTOMER) {
        await context.services.notification.sendCustomerUpdateNotification(context, company);
      }

      return company;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteCompany = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    try {
      await context.models.Company.destroy({ where: { id, tenantId }, force: true });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteCompanies = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    try {
      await context.models.Company.destroy({ where: { id: { [Op.in]: body.ids }, tenantId }, force: true });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    deleteCompanies,
  };
};

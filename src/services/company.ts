import { Op } from "sequelize";
import type { Context } from "../types";
import type { Company, CreateCompanyProperties } from "../models/interfaces/company";
import type { COMPANY_TYPE } from "../constants";

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
    const companies = await context.models.Company.findAll({
      attributes: ["id", "name", "status", "taxNumber", "prefix"],
      where: { tenantId, type },
      include: [{
        model: context.models.ProfilePicture,
        attributes: ["image", "mimeType"],
        as: "logo",
        foreignKey: "ownerId"
      }]
    });

    return companies;
  };

  const getCompany = async (context: Context, tenantId: number, id: number): Promise<Partial<Company> | null> => {
    const company = await context.models.Company.findOne({
      where: { tenantId, id },
      include: [{
        model: context.models.ProfilePicture,
        attributes: ["image", "mimeType"],
        as: "logo",
        foreignKey: "ownerId"
      }]
    });

    return company;
  };

  const createCompany = async (context: Context, tenantId: number, createdBy: number, data: CreateCompanyProperties): Promise<Partial<Company> | null> => {
    const company = await context.models.Company.create({ ...data, tenantId, createdBy });

    return company;
  };

  const updateCompany = async (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Company>): Promise<Partial<Company> | null> => {
    const company = await context.models.Company.findOne({
      where: { tenantId, id }
    });

    if (!company) {
      return null;
    }

    await company.update({ ...data, updatedBy });

    return company;
  };

  const deleteCompany = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    await context.models.Company.destroy({ where: { id, tenantId }, transaction: t, force: true });
    await t.commit();

    return { success: true };
  };

  const deleteCompanies = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    await context.models.Company.destroy({ where: { id: { [Op.in]: body.ids }, tenantId }, transaction: t, force: true });
    await t.commit();

    return { success: true };
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

import { Op } from "sequelize";
import type { Context } from "../types";
import type { Company, CreateCompanyProperties } from "../models/interfaces/company";
import type { Contact } from "../models/interfaces/contact";
import { COMPANY_TYPE } from "../constants";
import { Location } from "../models/interfaces/location";
import { Document } from "@react-pdf/renderer";

export interface CompanyService {
  getCompanies: (context: Context, tenantId: number, type: COMPANY_TYPE.CONTRACTOR | COMPANY_TYPE.CUSTOMER | COMPANY_TYPE.SUPPLIER) => Promise<Array<Partial<Company>>>
  getCompany: (context: Context, tenantId: number, id: number) => Promise<Partial<Company> | null>
  createCompany: (context: Context, tenantId: number, createdBy: number, body: CreateCompanyProperties) => Promise<Partial<Company> | null>
  updateCompany: (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Company>) => Promise<Partial<Company> | null>
  deleteCompany: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteCompanies: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
  addContacts: (context: Context, tenantId: number, id: number, contacts: Partial<Contact>[]) => Promise<{ success: boolean }>
  addLocations: (context: Context, tenantId: number, id: number, locations: Partial<Location>[]) => Promise<{ success: boolean }>
  getDocuments: (context: Context, ownerId: number) => Promise<Partial<Document>[]>
}

export const companyService = (): CompanyService => {
  const getCompanies = async (context: Context, tenantId: number, type: COMPANY_TYPE.CONTRACTOR | COMPANY_TYPE.CUSTOMER | COMPANY_TYPE.SUPPLIER): Promise<Array<Partial<Company>>> => {
    try {
      return await context.models.Company.findAll({
        attributes: ["id", "name", "status", "taxNumber", "prefix", "notes", "city", "country", "address", "zipCode", "default"],
        where: { tenantId, type },
        include: [
          {
            model: context.models.Document,
            attributes: ["id", "name", "type", "mimeType", "stored"],
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
          model: context.models.Location,
          attributes: ["id", "name", "country", "city", "address", "zipCode", "status"],
          as: "locations",
          through: { attributes: [] }
        }, {
          model: context.models.Contact,
          attributes: ["id", "name", "email", "phoneNumber", "status"],
          as: "contacts",
          through: { attributes: [] }
        }, {
          model: context.models.Document,
          attributes: ["id", "name", "type", "mimeType", "stored"],
          as: "documents",
          foreignKey: "ownerId"
        }]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getDocuments = async (context: Context, ownerId: number): Promise<Partial<Document>[]> => {
    return await context.models.Document.findAll({
      where: { ownerId, ownerType: "company" },
      attributes: ["id", "name", "type", "mimeType", "stored"],
      raw: true
    });
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

  const addContacts = async (context: Context, tenantId: number, id: number, contacts: Partial<Contact>[]): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const company = await context.models.Company.findOne({
        where: { tenantId, id }
      });

      if (!company) {
        return { success: false };
      }

      const companyContacts = await company.getContacts();
      for (const contact of companyContacts) {
        await company.removeContact(contact, { transaction: t });
      }

      if (contacts.length > 0) {
        const notExistedContacts = contacts.filter((contact) => !contact.id);
        for (const contact of notExistedContacts) {
          const newContact = await context.models.Contact.create({
            ...contact,
            tenantId
          } as Contact);

          await company.addContact(newContact, { transaction: t });
        }

        const existedContacts = contacts.filter((contact) => contact.id);
        for (const contact of existedContacts) {
          await company.addContact(contact.id, { transaction: t });
        }
      }

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  const addLocations = async (context: Context, tenantId: number, id: number, locations: Partial<Location>[]): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const company = await context.models.Company.findOne({
        where: { tenantId, id }
      });

      if (!company) {
        return { success: false };
      }

      const companyLocations = await company.getLocations();
      for (const location of companyLocations) {
        await company.removeLocation(location, { transaction: t });
      }

      if (locations.length > 0) {
        const notExistedLocations = locations.filter((location) => !location.id);
        for (const location of notExistedLocations) {
          const newLocation = await context.models.Location.create({
            ...location,
            tenantId
          } as Location);

          await company.addLocation(newLocation, { transaction: t });
        }

        const existedLocations = locations.filter((location) => location.id);
        for (const location of existedLocations) {
          await company.addLocation(location.id, { transaction: t });
        }
      }

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  }

  return {
    getCompanies,
    getDocuments,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    deleteCompanies,
    addContacts,
    addLocations
  };
};

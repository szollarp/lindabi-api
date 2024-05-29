import { Op } from "sequelize";
import type { Context } from "../types";
import type { Contact, CreateContactProperties } from "../models/interfaces/contact";

export interface ContactService {
  getContacts: (context: Context, tenantId: number) => Promise<Array<Partial<Contact>>>
  getContact: (context: Context, tenantId: number, id: number) => Promise<Partial<Contact> | null>
  createContact: (context: Context, tenantId: number, createdBy: number, body: CreateContactProperties) => Promise<Partial<Contact> | null>
  updateContact: (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Contact>) => Promise<Partial<Contact> | null>
  deleteContact: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteContacts: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
  addToCompany: (context: Context, tenantId: number, id: number, body: { id: number }) => Promise<{ success: boolean }>
  removeFromCompany: (context: Context, tenantId: number, id: number, body: { id: number }) => Promise<{ success: boolean }>
}

export const contactService = (): ContactService => {
  const getContacts = async (context: Context, tenantId: number): Promise<Array<Partial<Contact>>> => {
    return await context.models.Contact.findAll({
      attributes: ["id", "name", "email", "phoneNumber", "status", "notes"],
      where: { tenantId }
    });
  };

  const getContact = async (context: Context, tenantId: number, id: number): Promise<Partial<Contact> | null> => {
    return await context.models.Contact.findOne({
      attributes: ["id", "name", "email", "phoneNumber", "status", "notes"],
      where: { tenantId, id },
      include: [
        {
          model: context.models.Company,
          as: "companies",
          attributes: ["id", "name", "country", "city", "address", "zipCode"],
          through: { attributes: [] }
        }
      ]
    });
  };

  const createContact = async (context: Context, tenantId: number, createdBy: number, data: CreateContactProperties): Promise<Partial<Contact> | null> => {
    return await context.models.Contact.create({ ...data, tenantId, createdBy });
  };

  const updateContact = async (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Contact>): Promise<Partial<Contact> | null> => {
    const Contact = await context.models.Contact.findOne({
      where: { tenantId, id }
    });

    if (!Contact) {
      return null;
    }

    await Contact.update({ ...data, updatedBy });

    return Contact;
  };

  const deleteContact = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    await context.models.Contact.destroy({ where: { id, tenantId }, transaction: t, force: true });
    await t.commit();

    return { success: true };
  };

  const deleteContacts = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    await context.models.Contact.destroy({ where: { id: { [Op.in]: body.ids }, tenantId }, transaction: t, force: true });
    await t.commit();

    return { success: true };
  };

  const addToCompany = async (context: Context, tenantId: number, id: number, body: { id: number }): Promise<{ success: boolean }> => {
    try {
      const contact = await context.models.Contact.findOne({
        where: { tenantId, id }
      });

      if (!contact) {
        return { success: false };
      }

      const company = await context.models.Company.findOne({
        where: { tenantId, id: body.id }
      });

      if (!company) {
        return { success: false };
      }

      await company.addContact(contact);
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const removeFromCompany = async (context: Context, tenantId: number, id: number, body: { id: number }): Promise<{ success: boolean }> => {
    try {
      const contact = await context.models.Contact.findOne({
        where: { tenantId, id }
      });

      if (!contact) {
        return { success: false };
      }

      const company = await context.models.Company.findOne({
        where: { tenantId, id: body.id }
      });

      if (!company) {
        return { success: false };
      }

      await company.removeContact(contact);
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    deleteContacts,
    addToCompany,
    removeFromCompany
  };
};

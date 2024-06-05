import { Op } from "sequelize";
import type { Context } from "../types";

export type GlobalSearchResponse = Array<{
  entity: string;
  id: number;
  name?: string;
  type?: string;
}>;

export interface SearchService {
  globalSearch: (context: Context, body: { keyword: string }) => Promise<GlobalSearchResponse>
}

export const searchService = (): SearchService => {
  const globalSearch = async (context: Context, body: { keyword: string }): Promise<GlobalSearchResponse> => {
    try {
      const users = await context.models.User.findAll({
        attributes: ["id", "name", "email", "phoneNumber"],
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${body.keyword}%` } },
            { email: { [Op.like]: `%${body.keyword}%` } },
            { phoneNumber: { [Op.like]: `%${body.keyword}%` } }
          ]
        }
      });

      const contacts = await context.models.Contact.findAll({
        attributes: ["id", "name", "email", "phoneNumber"],
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${body.keyword}%` } },
            { email: { [Op.like]: `%${body.keyword}%` } },
            { phoneNumber: { [Op.like]: `%${body.keyword}%` } }
          ]
        }
      });

      const companies = await context.models.Company.findAll({
        attributes: ["id", "name", "type", "taxNumber"],
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${body.keyword}%` } },
            { taxNumber: { [Op.like]: `%${body.keyword}%` } }
          ]
        }
      });

      const tenders = await context.models.Tender.findAll({
        attributes: ["id", "type", "notes"],
        where: {
          [Op.or]: [
            { type: { [Op.like]: `%${body.keyword}%` } },
            { notes: { [Op.like]: `%${body.keyword}%` } }
          ]
        }
      });

      return [
        ...users.map((user) => ({
          entity: "user", ...user.toJSON(), path: `/dashboard/user/${user.id}/view`
        })),
        ...contacts.map((contact) => ({
          entity: "contact", ...contact.toJSON(), path: `/dashboard/contact/${contact.id}/view`
        })),
        ...companies.map((company) => ({
          entity: company.type, ...company.toJSON(), path: `/dashboard/${company.type}/${company.id}/view`
        })),
        ...tenders.map((tender) => ({
          entity: "tender", ...tender.toJSON(), path: `/dashboard/tender/${tender.id}/view`
        }))
      ]
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  return {
    globalSearch
  }
};
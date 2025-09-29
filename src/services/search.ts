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
      // Create multiple search patterns for accent-insensitive search
      const createSearchPatterns = (text: string): string[] => {
        const patterns: string[] = [];
        const normalized = text.toLowerCase();

        // Original text
        patterns.push(`%${normalized}%`);

        // Common accent variations for Hungarian
        const accentMap: { [key: string]: string[] } = {
          'a': ['á', 'à', 'â', 'ä'],
          'e': ['é', 'è', 'ê', 'ë'],
          'i': ['í', 'ì', 'î', 'ï'],
          'o': ['ó', 'ò', 'ô', 'ö'],
          'u': ['ú', 'ù', 'û', 'ü'],
          'c': ['ç'],
          's': ['ş', 'š'],
          'z': ['ž', 'ż']
        };

        // Generate patterns with common accent variations
        // Create all possible combinations of accent variations
        const generateVariations = (text: string, baseIndex: number = 0): string[] => {
          if (baseIndex >= Object.keys(accentMap).length) {
            return [text];
          }

          const base = Object.keys(accentMap)[baseIndex];
          const accents = accentMap[base];
          const variations: string[] = [];

          if (text.includes(base)) {
            // Generate variations for this base character
            for (const accent of accents) {
              const variant = text.replace(new RegExp(base, 'g'), accent);
              variations.push(...generateVariations(variant, baseIndex + 1));
            }
            // Also keep the original for other base characters
            variations.push(...generateVariations(text, baseIndex + 1));
          } else {
            // No this base character, continue with next
            variations.push(...generateVariations(text, baseIndex + 1));
          }

          return variations;
        };

        const variations = generateVariations(normalized);
        patterns.push(...variations.map(v => `%${v}%`));

        return patterns;
      };

      const searchPatterns = createSearchPatterns(body.keyword);

      const users = await context.models.User.findAll({
        attributes: ["id", "name", "email", "phoneNumber"],
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: { [Op.any]: searchPatterns } } },
            { email: { [Op.iLike]: { [Op.any]: searchPatterns } } },
            { phoneNumber: { [Op.iLike]: { [Op.any]: searchPatterns } } }
          ]
        }
      });

      const contacts = await context.models.Contact.findAll({
        attributes: ["id", "name", "email", "phoneNumber"],
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: { [Op.any]: searchPatterns } } },
            { email: { [Op.iLike]: { [Op.any]: searchPatterns } } },
            { phoneNumber: { [Op.iLike]: { [Op.any]: searchPatterns } } }
          ]
        }
      });

      const companies = await context.models.Company.findAll({
        attributes: ["id", "name", "type", "taxNumber"],
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: { [Op.any]: searchPatterns } } },
            { taxNumber: { [Op.iLike]: { [Op.any]: searchPatterns } } }
          ]
        }
      });

      const tenders = await context.models.Tender.findAll({
        attributes: ["id", "type", "notes"],
        where: {
          [Op.or]: [
            { type: { [Op.iLike]: { [Op.any]: searchPatterns } } },
            { notes: { [Op.iLike]: { [Op.any]: searchPatterns } } }
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
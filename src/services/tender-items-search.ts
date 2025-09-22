import { Op, literal, fn, col } from "sequelize";
import type { Context } from "../types";
import { TenderItemsSearchSearchParams, TenderItemsSearchResult } from "../models/interfaces/tender-items-search";

export interface TenderItemsSearchService {
  searchItems: (context: Context, params: TenderItemsSearchSearchParams) => Promise<TenderItemsSearchResult[]>;
  syncTenderItem: (context: Context, tenderItemId: number) => Promise<void>;
  deleteTenderItem: (context: Context, tenderItemId: number) => Promise<void>;
  backfillSearchTable: (context: Context) => Promise<{ processed: number; errors: number }>;
  updateUsageStats: (context: Context, tenderItemId: number) => Promise<void>;
}

export const tenderItemsSearchService = (): TenderItemsSearchService => {
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const searchItems = async (context: Context, params: TenderItemsSearchSearchParams): Promise<TenderItemsSearchResult[]> => {
    const { query, limit = 20, offset = 0, tenantId } = params;

    if (query.length < 2) {
      return [];
    }

    const normalizedQuery = normalizeText(query);
    const searchPattern = `%${normalizedQuery}%`;

    try {
      const results = await context.models.TenderItemsSearch.findAll({
        attributes: [
          'id',
          'itemId',
          'name',
          'unit',
          'defaultPriceNet',
          'currency',
          'vatRate',
          'usageCount',
          'lastUsedAt',
          'aliasNames',
          'tags',
          [
            literal(`
              CASE 
                WHEN normalized_name ILIKE '${normalizedQuery}%' THEN 1
                WHEN normalized_name ILIKE '%${normalizedQuery}%' THEN 2
                WHEN alias_names::text ILIKE '%${normalizedQuery}%' THEN 3
                WHEN tags::text ILIKE '%${normalizedQuery}%' THEN 4
                ELSE 5
              END
            `),
            'rank'
          ],
          [
            literal(`
              GREATEST(
                similarity(normalized_name, '${normalizedQuery}'),
                CASE 
                  WHEN alias_names::text ILIKE '%${normalizedQuery}%' THEN 0.8
                  ELSE 0
                END,
                CASE 
                  WHEN tags::text ILIKE '%${normalizedQuery}%' THEN 0.6
                  ELSE 0
                END
              )
            `),
            'similarity'
          ]
        ],
        where: {
          tenantId,
          active: true,
          [Op.or]: [
            { normalizedName: { [Op.iLike]: searchPattern } },
            { aliasNames: { [Op.contains]: [normalizedQuery] } },
            { tags: { [Op.contains]: [normalizedQuery] } }
          ]
        },
        order: [
          [literal('rank'), 'ASC'],
          [literal('similarity'), 'DESC'],
          ['usageCount', 'DESC'],
          ['lastUsedAt', 'DESC'],
          ['name', 'ASC']
        ],
        limit,
        offset,
        raw: true
      });

      return results.map((result: any) => ({
        id: result.id,
        tenderItemId: result.tenderItemId,
        name: result.name,
        unit: result.unit,
        defaultPriceNet: result.defaultPriceNet,
        currency: result.currency,
        vatRate: result.vatRate,
        usageCount: result.usageCount,
        lastUsedAt: result.lastUsedAt,
        aliasNames: result.aliasNames || [],
        tags: result.tags || [],
        similarity: result.similarity,
        rank: result.rank
      }));
    } catch (error) {
      context.logger.error('Error searching tender items:', error);
      throw error;
    }
  };

  const syncTenderItem = async (context: Context, tenderItemId: number): Promise<void> => {
    try {
      const tenderItem = await context.models.TenderItem.findByPk(tenderItemId, {
        include: [
          {
            model: context.models.Tender,
            as: 'tender',
            include: [{ model: context.models.Tenant, as: 'tenant' }]
          }
        ]
      });

      if (!tenderItem || !tenderItem.tender) {
        // Tender item doesn't exist, remove from search table
        await context.models.TenderItemsSearch.destroy({
          where: { tenderItemId }
        });
        return;
      }

      const normalizedName = normalizeText(tenderItem.name);

      // Check if search record exists
      const existingSearchRecord = await context.models.TenderItemsSearch.findOne({
        where: { tenderItemId }
      });

      const searchData = {
        tenderItemId: tenderItem.id,
        tenantId: tenderItem.tender.tenantId!,
        active: true,
        name: tenderItem.name,
        normalizedName,
        unit: tenderItem.unit,
        defaultPriceNet: tenderItem.materialNetUnitAmount + tenderItem.feeNetUnitAmount,
        currency: tenderItem.tender.currency || 'HUF',
        vatRate: null, // This would need to be calculated from tender vatKey
        usageCount: existingSearchRecord?.usageCount || 0,
        lastUsedAt: existingSearchRecord?.lastUsedAt || null,
        aliasNames: [], // This would need to be populated from a separate table
        tags: [] // Tender items don't have categories, but could be added
      };

      if (existingSearchRecord) {
        await existingSearchRecord.update(searchData);
      } else {
        await context.models.TenderItemsSearch.create(searchData);
      }
    } catch (error) {
      context.logger.error(`Error syncing tender item ${tenderItemId}:`, error);
      throw error;
    }
  };

  const deleteTenderItem = async (context: Context, tenderItemId: number): Promise<void> => {
    try {
      await context.models.TenderItemsSearch.destroy({
        where: { tenderItemId }
      });
    } catch (error) {
      context.logger.error(`Error deleting search record for tender item ${tenderItemId}:`, error);
      throw error;
    }
  };

  const backfillSearchTable = async (context: Context): Promise<{ processed: number; errors: number }> => {
    let processed = 0;
    let errors = 0;

    try {
      // Clear existing search records
      await context.models.TenderItemsSearch.destroy({
        where: {},
        truncate: true
      });

      // Get all tender items with their tender and tenant information
      const tenderItems = await context.models.TenderItem.findAll({
        include: [
          {
            model: context.models.Tender,
            as: 'tender',
            include: [{ model: context.models.Tenant, as: 'tenant' }]
          }
        ],
        where: {
          '$tender.tenantId$': { [Op.ne]: null }
        }
      });

      for (const tenderItem of tenderItems) {
        try {
          await syncTenderItem(context, tenderItem.id);
          processed++;
        } catch (error) {
          context.logger.error(`Error processing tender item ${tenderItem.id}:`, error);
          errors++;
        }
      }

      context.logger.info(`Backfill completed: ${processed} items processed, ${errors} errors`);
    } catch (error) {
      context.logger.error('Error during backfill:', error);
      throw error;
    }

    return { processed, errors };
  };

  const updateUsageStats = async (context: Context, tenderItemId: number): Promise<void> => {
    try {
      await context.models.TenderItemsSearch.increment('usageCount', {
        where: { tenderItemId }
      });

      await context.models.TenderItemsSearch.update(
        { lastUsedAt: new Date() },
        { where: { tenderItemId } }
      );
    } catch (error) {
      context.logger.error(`Error updating usage stats for tender item ${tenderItemId}:`, error);
      throw error;
    }
  };

  return {
    searchItems,
    syncTenderItem,
    deleteTenderItem,
    backfillSearchTable,
    updateUsageStats
  };
};

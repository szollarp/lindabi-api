import { Op } from "sequelize";
import type { Context } from "../types";

/**
 * Utility functions to help identify and clean up duplicate tender numbers
 */
export class TenderDuplicateCleanup {
  /**
   * Find all duplicate tender numbers within a tenant
   */
  static async findDuplicates(context: Context, tenantId: number): Promise<Array<{
    number: string;
    count: number;
    tenderIds: number[];
  }>> {
    const duplicates = await context.models.Tender.findAll({
      attributes: [
        'number',
        [context.models.sequelize.fn('COUNT', context.models.sequelize.col('id')), 'count'],
        [context.models.sequelize.fn('ARRAY_AGG', context.models.sequelize.col('id')), 'tenderIds']
      ],
      where: {
        tenantId,
        number: { [Op.ne]: null }
      },
      group: ['number'],
      having: context.models.sequelize.where(
        context.models.sequelize.fn('COUNT', context.models.sequelize.col('id')),
        '>',
        1
      ),
      raw: true
    });

    return duplicates.map((duplicate: any) => ({
      number: duplicate.number,
      count: parseInt(duplicate.count),
      tenderIds: duplicate.tenderIds
    }));
  }

  /**
   * Clean up duplicate tender numbers by appending a suffix to duplicates
   */
  static async cleanupDuplicates(context: Context, tenantId: number): Promise<{
    cleaned: number;
    duplicates: Array<{ number: string; count: number; tenderIds: number[] }>;
  }> {
    const duplicates = await this.findDuplicates(context, tenantId);
    let cleaned = 0;

    for (const duplicate of duplicates) {
      // Keep the first tender (oldest) with the original number
      const sortedIds = duplicate.tenderIds.sort((a, b) => a - b);
      const keepId = sortedIds[0];
      const duplicateIds = sortedIds.slice(1);

      // Update duplicate tenders with a suffix
      for (let i = 0; i < duplicateIds.length; i++) {
        const newNumber = `${duplicate.number}-dup-${i + 1}`;
        await context.models.Tender.update(
          { number: newNumber },
          { where: { id: duplicateIds[i] } }
        );
        cleaned++;
      }
    }

    return { cleaned, duplicates };
  }

  /**
   * Get statistics about tender number usage
   */
  static async getTenderNumberStats(context: Context, tenantId: number): Promise<{
    totalTenders: number;
    tendersWithNumbers: number;
    uniqueNumbers: number;
    duplicates: number;
  }> {
    const totalTenders = await context.models.Tender.count({ where: { tenantId } });

    const tendersWithNumbers = await context.models.Tender.count({
      where: { tenantId, number: { [Op.ne]: null } }
    });

    const uniqueNumbers = await context.models.Tender.count({
      attributes: ['number'],
      where: { tenantId, number: { [Op.ne]: null } },
      group: ['number'],
      distinct: true
    });

    const duplicates = await this.findDuplicates(context, tenantId);
    const duplicateCount = duplicates.reduce((sum, dup) => sum + dup.count - 1, 0);

    return {
      totalTenders,
      tendersWithNumbers,
      uniqueNumbers: uniqueNumbers.length,
      duplicates: duplicateCount
    };
  }
}

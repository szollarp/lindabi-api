import { Op } from "sequelize";
import type { Context } from "../types";
import { StockReport, StockItem, StockFilters } from "../models/interfaces/stock";

export interface StockService {
  getStockReport: (context: Context, tenantId: number, entityType: 'warehouse' | 'project', entityId: number) => Promise<StockReport>
  getStockItems: (context: Context, tenantId: number, entityType: 'warehouse' | 'project', entityId: number, filters: StockFilters) => Promise<StockItem[]>
  getStockTransactions: (context: Context, tenantId: number, entityType: 'warehouse' | 'project', entityId: number, filters: Partial<StockFilters>) => Promise<any[]>
}

export const stockService = (): StockService => {
  const getStockReport = async (
    context: Context,
    tenantId: number,
    entityType: 'warehouse' | 'project',
    entityId: number
  ): Promise<StockReport> => {
    try {
      // Get the entity (warehouse or project)
      const entity = entityType === 'warehouse'
        ? await context.models.Warehouse.findOne({ where: { id: entityId, tenantId } })
        : await context.models.Project.findOne({ where: { id: entityId, tenantId } });

      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      // Get all items for the tenant
      const items = await context.models.Item.findAll({
        where: { tenantId },
        include: [
          {
            model: context.models.ItemMovement,
            as: 'itemMovements',
            where: {
              [Op.or]: [
                { source: entityType, sourceId: entityId },
                { target: entityType, targetId: entityId }
              ]
            },
            required: true
          }
        ]
      });

      // Calculate stock levels for each item
      const stockItems: StockItem[] = items.map(item => {
        const movements = item.itemMovements || [];

        let currentStock = 0;
        let totalIssued = 0;
        let totalReturned = 0;
        let totalProcured = 0;
        let totalTransferredIn = 0;
        let totalTransferredOut = 0;
        let lastTransactionDate: Date | undefined;

        movements.forEach(movement => {
          const quantity = movement.quantity || 0;
          const movementDate = movement.createdOn;

          if (movementDate && (!lastTransactionDate || movementDate > lastTransactionDate)) {
            lastTransactionDate = movementDate;
          }

          if (movement.source === entityType && movement.sourceId === entityId) {
            // Item is leaving this entity
            if (movement.type === 'issue') {
              totalIssued += quantity;
              currentStock -= quantity;
            } else if (movement.type === 'transfer') {
              totalTransferredOut += quantity;
              currentStock -= quantity;
            }
          }

          if (movement.target === entityType && movement.targetId === entityId) {
            // Item is coming to this entity
            if (movement.type === 'return') {
              totalReturned += quantity;
              currentStock += quantity;
            } else if (movement.type === 'procurement') {
              totalTransferredIn += quantity;
              currentStock += quantity;
            } else if (movement.type === 'transfer') {
              totalTransferredIn += quantity;
              currentStock += quantity;
            }
          }
        });

        return {
          itemId: item.id!,
          item: item,
          currentStock: Math.max(0, currentStock), // Ensure non-negative stock
          totalIssued,
          totalReturned,
          totalProcured,
          totalTransferredIn,
          totalTransferredOut,
          lastTransactionDate
        };
      }) ?? [];

      // Get all transactions related to this entity
      const transactions = await context.models.ItemMovement.findAll({
        where: {
          tenantId,
          [Op.or]: [
            { source: entityType, sourceId: entityId },
            { target: entityType, targetId: entityId }
          ]
        },
        include: [
          { model: context.models.Item, as: 'item' },
          { model: context.models.User, as: 'employee' },
          { model: context.models.Warehouse, as: 'sourceWarehouse' },
          { model: context.models.Project, as: 'sourceProject' },
          { model: context.models.Warehouse, as: 'targetWarehouse' },
          { model: context.models.Project, as: 'targetProject' }
        ],
        order: [['createdOn', 'DESC']]
      });

      return {
        entityType,
        entityId,
        entity: entity as any,
        items: stockItems,
        transactions: transactions as any,
        totalItems: stockItems.length,
        lastUpdated: new Date()
      };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getStockItems = async (
    context: Context,
    tenantId: number,
    entityType: 'warehouse' | 'project',
    entityId: number,
    filters: StockFilters
  ): Promise<StockItem[]> => {
    try {
      const report = await getStockReport(context, tenantId, entityType, entityId);
      let filteredItems = report.items;

      // Apply keyword filter
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.item.name.toLowerCase().includes(keyword) ||
          item.item.manufacturer?.toLowerCase().includes(keyword)
        );
      }

      // Apply zero stock filter
      if (!filters.showZeroStock) {
        filteredItems = filteredItems.filter(item => item.currentStock > 0);
      }

      // Apply sorting
      filteredItems.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case 'itemName':
            comparison = a.item.name.localeCompare(b.item.name);
            break;
          case 'currentStock':
            comparison = a.currentStock - b.currentStock;
            break;
          case 'lastTransaction':
            const dateA = a.lastTransactionDate ? new Date(a.lastTransactionDate).getTime() : 0;
            const dateB = b.lastTransactionDate ? new Date(b.lastTransactionDate).getTime() : 0;
            comparison = dateA - dateB;
            break;
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });

      return filteredItems;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getStockTransactions = async (
    context: Context,
    tenantId: number,
    entityType: 'warehouse' | 'project',
    entityId: number,
    filters: Partial<StockFilters>
  ): Promise<any[]> => {
    try {
      const whereClause: any = {
        tenantId,
        [Op.or]: [
          { source: entityType, sourceId: entityId },
          { target: entityType, targetId: entityId }
        ]
      };

      // Apply keyword filter if provided
      if (filters.keyword) {
        whereClause[Op.or] = [
          ...whereClause[Op.or],
          {
            [Op.or]: [
              { '$item.name$': { [Op.iLike]: `%${filters.keyword}%` } },
              { '$employee.name$': { [Op.iLike]: `%${filters.keyword}%` } }
            ]
          }
        ];
      }

      const transactions = await context.models.ItemMovement.findAll({
        where: whereClause,
        include: [
          { model: context.models.Item, as: 'item' },
          { model: context.models.User, as: 'employee' },
          { model: context.models.Warehouse, as: 'sourceWarehouse' },
          { model: context.models.Project, as: 'sourceProject' },
          { model: context.models.Warehouse, as: 'targetWarehouse' },
          { model: context.models.Project, as: 'targetProject' }
        ],
        order: [['createdOn', 'DESC']]
      });

      return transactions as any;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    getStockReport,
    getStockItems,
    getStockTransactions
  };
};

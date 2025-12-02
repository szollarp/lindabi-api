import { Op, Transaction } from "sequelize";
import type { Context } from "../types";
import { CreateItemMovementProperties, ItemMovement, UpdateItemMovementProperties } from "../models/interfaces/item-movement";

export interface ItemMovementFilters {
  type?: 'issue' | 'return' | 'transfer';
  itemId?: number;
  source?: 'warehouse' | 'project';
  target?: 'warehouse' | 'project';
  employeeId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ItemMovementService {
  getItemMovements: (context: Context, tenantId: number, page: number, limit: number, filters: ItemMovementFilters) => Promise<{ data: ItemMovement[], total: number, page: number, limit: number }>
  getItemMovement: (context: Context, tenantId: number, id: number) => Promise<ItemMovement | null>
  createItemMovements: (context: Context, tenantId: number, createdBy: number, data: CreateItemMovementProperties) => Promise<ItemMovement[]>
  updateItemMovement: (context: Context, tenantId: number, id: number, updatedBy: number, data: UpdateItemMovementProperties) => Promise<ItemMovement | null>
  deleteItemMovement: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  getItemMovementsByEntity: (context: Context, tenantId: number, entityType: 'warehouse' | 'project', entityId: number, page: number, limit: number) => Promise<{ data: ItemMovement[], total: number, page: number, limit: number }>
}

export const itemMovementService = (): ItemMovementService => {
  const getItemMovements = async (
    context: Context,
    tenantId: number,
    page: number,
    limit: number,
    filters: ItemMovementFilters
  ): Promise<{ data: ItemMovement[], total: number, page: number, limit: number }> => {
    try {
      const whereClause: any = { tenantId };

      // Apply filters
      if (filters.type) {
        whereClause.type = filters.type;
      }
      if (filters.itemId) {
        whereClause.itemId = filters.itemId;
      }
      if (filters.source) {
        whereClause.source = filters.source;
      }
      if (filters.target) {
        whereClause.target = filters.target;
      }
      if (filters.employeeId) {
        whereClause.employeeId = filters.employeeId;
      }
      if (filters.startDate || filters.endDate) {
        whereClause.createdOn = {};
        if (filters.startDate) {
          whereClause.createdOn[Op.gte] = filters.startDate;
        }
        if (filters.endDate) {
          whereClause.createdOn[Op.lte] = filters.endDate;
        }
      }

      const offset = (page - 1) * limit;

      const { rows: data, count: total } = await context.models.ItemMovement.findAndCountAll({
        where: whereClause,
        include: [
          { model: context.models.Item, as: 'item' },
          { model: context.models.User, as: 'employee' },
          {
            model: context.models.User,
            as: 'receiver',
            required: false
          },
          {
            model: context.models.Company,
            as: 'supplier',
            required: false
          },
          {
            model: context.models.Warehouse,
            as: 'sourceWarehouse',
            required: false
          },
          {
            model: context.models.Project,
            as: 'sourceProject',
            required: false
          },
          {
            model: context.models.Warehouse,
            as: 'targetWarehouse',
            required: false
          },
          {
            model: context.models.Project,
            as: 'targetProject',
            required: false
          }
        ],
        order: [['createdOn', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return {
        data: data as any,
        total,
        page,
        limit
      };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getItemMovement = async (context: Context, tenantId: number, id: number): Promise<ItemMovement | null> => {
    try {
      return await context.models.ItemMovement.findOne({
        where: { tenantId, id },
        include: [
          { model: context.models.Item, as: 'item' },
          { model: context.models.User, as: 'employee' },
          { model: context.models.User, as: 'receiver' },
          { model: context.models.Company, as: 'supplier' },
          { model: context.models.Warehouse, as: 'sourceWarehouse' },
          { model: context.models.Project, as: 'sourceProject' },
          { model: context.models.Warehouse, as: 'targetWarehouse' },
          { model: context.models.Project, as: 'targetProject' }
        ]
      }) as any;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const createItemMovements = async (
    context: Context,
    tenantId: number,
    createdBy: number,
    data: CreateItemMovementProperties
  ): Promise<ItemMovement[]> => {
    let transaction: Transaction | null = null;

    try {
      context.logger.info('Creating item movements with data:', JSON.stringify(data, null, 2));
      transaction = await context.models.sequelize.transaction();

      // Create item movements for each item in the array
      const itemMovementsData = data.items.map(item => ({
        type: data.type,
        itemId: item.itemId,
        quantity: item.quantity,
        employeeId: data.employeeId,
        receiverId: data.receiverId || undefined,
        supplierId: data.supplierId || undefined,
        source: data.source || undefined,
        sourceId: data.sourceId || undefined,
        target: data.target || undefined,
        targetId: data.targetId || undefined,
        tenantId,
        createdBy
      })) as any;

      const createdMovements = await context.models.ItemMovement.bulkCreate(
        itemMovementsData,
        { transaction }
      );

      await transaction.commit();

      // Fetch the created movements with all associations
      const movementIds = createdMovements.map(movement => movement.id);
      const movementsWithAssociations = await context.models.ItemMovement.findAll({
        where: { id: { [Op.in]: movementIds } },
        include: [
          { model: context.models.Item, as: 'item' },
          { model: context.models.User, as: 'employee' },
          { model: context.models.User, as: 'receiver' },
          { model: context.models.Company, as: 'supplier' },
          { model: context.models.Warehouse, as: 'sourceWarehouse' },
          { model: context.models.Project, as: 'sourceProject' },
          { model: context.models.Warehouse, as: 'targetWarehouse' },
          { model: context.models.Project, as: 'targetProject' }
        ]
      });

      return movementsWithAssociations as any;
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }

      context.logger.error(error);
      throw error;
    }
  };

  const updateItemMovement = async (
    context: Context,
    tenantId: number,
    id: number,
    updatedBy: number,
    data: UpdateItemMovementProperties
  ): Promise<ItemMovement | null> => {
    try {
      const itemMovement = await context.models.ItemMovement.findOne({
        where: { tenantId, id }
      });

      if (!itemMovement) {
        return null;
      }

      await itemMovement.update({
        ...data,
        updatedBy
      });

      // Return the updated item movement with all associations
      return await getItemMovement(context, tenantId, id);
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteItemMovement = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    try {
      const itemMovement = await context.models.ItemMovement.findOne({
        where: { tenantId, id }
      });

      if (!itemMovement) {
        return { success: false };
      }

      await itemMovement.destroy();
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };


  const getItemMovementsByEntity = async (
    context: Context,
    tenantId: number,
    entityType: 'warehouse' | 'project',
    entityId: number,
    page: number,
    limit: number
  ): Promise<{ data: ItemMovement[], total: number, page: number, limit: number }> => {
    try {
      const whereClause = {
        tenantId,
        [Op.or]: [
          { source: entityType, sourceId: entityId },
          { target: entityType, targetId: entityId }
        ]
      };

      const offset = (page - 1) * limit;

      const { rows: data, count: total } = await context.models.ItemMovement.findAndCountAll({
        where: whereClause,
        include: [
          { model: context.models.Item, as: 'item' },
          { model: context.models.User, as: 'employee' },
          {
            model: context.models.User,
            as: 'receiver',
            required: false
          },
          {
            model: context.models.Company,
            as: 'supplier',
            required: false
          },
          {
            model: context.models.Warehouse,
            as: 'sourceWarehouse',
            required: false
          },
          {
            model: context.models.Project,
            as: 'sourceProject',
            required: false
          },
          {
            model: context.models.Warehouse,
            as: 'targetWarehouse',
            required: false
          },
          {
            model: context.models.Project,
            as: 'targetProject',
            required: false
          }
        ],
        order: [['createdOn', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return {
        data: data as any,
        total,
        page,
        limit
      };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    getItemMovements,
    getItemMovement,
    createItemMovements,
    updateItemMovement,
    deleteItemMovement,
    getItemMovementsByEntity
  };
};

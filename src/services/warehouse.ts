import { Op } from "sequelize";
import type { Context } from "../types";
import { CreateWarehouseProperties, Warehouse } from "../models/interfaces/warehouse";

export interface WarehouseService {
  getWarehouses: (context: Context, tenantId: number) => Promise<Array<Partial<Warehouse>>>
  getWarehouse: (context: Context, tenantId: number, id: number) => Promise<Partial<Warehouse> | null>
  createWarehouse: (context: Context, tenantId: number, createdBy: number, body: CreateWarehouseProperties) => Promise<Partial<Warehouse> | null>
  updateWarehouse: (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Warehouse>) => Promise<Partial<Warehouse> | null>
  deleteWarehouse: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteWarehouses: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
}

export const warehouseService = (): WarehouseService => {
  const getWarehouses = async (context: Context, tenantId: number): Promise<Array<Partial<Warehouse>>> => {
    try {
      return await context.models.Warehouse.findAll({
        attributes: ["id", "name", "address", "city", "zipCode", "country", "createdOn", "updatedOn"],
        where: { tenantId },
        order: [["name", "ASC"]]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getWarehouse = async (context: Context, tenantId: number, id: number): Promise<Partial<Warehouse> | null> => {
    try {
      return await context.models.Warehouse.findOne({
        attributes: ["id", "name", "address", "city", "zipCode", "country", "createdOn", "updatedOn"],
        where: { tenantId, id }
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const createWarehouse = async (context: Context, tenantId: number, createdBy: number, data: CreateWarehouseProperties): Promise<Partial<Warehouse> | null> => {
    try {
      return await context.models.Warehouse.create({ ...data, tenantId, createdBy });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const updateWarehouse = async (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Warehouse>): Promise<Partial<Warehouse> | null> => {
    try {
      const warehouse = await context.models.Warehouse.findOne({
        where: { tenantId, id }
      });

      if (!warehouse) {
        return null;
      }

      await warehouse.update({ ...data, updatedBy });

      return warehouse;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteWarehouse = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    try {
      await context.models.Warehouse.destroy({ where: { id, tenantId } });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteWarehouses = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    try {
      await context.models.Warehouse.destroy({ where: { id: { [Op.in]: body.ids }, tenantId } });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    getWarehouses,
    getWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    deleteWarehouses
  };
};

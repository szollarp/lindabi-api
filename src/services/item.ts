import { Op } from "sequelize";
import type { Context } from "../types";
import { CreateItemProperties, Item } from "../models/interfaces/item";

export interface ItemService {
  getItems: (context: Context, tenantId: number) => Promise<Array<Partial<Item>>>
  getItem: (context: Context, tenantId: number, id: number) => Promise<Partial<Item> | null>
  createItem: (context: Context, tenantId: number, createdBy: number, body: CreateItemProperties) => Promise<Partial<Item> | null>
  updateItem: (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Item>) => Promise<Partial<Item> | null>
  deleteItem: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteItems: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
}

export const itemService = (): ItemService => {
  const getItems = async (context: Context, tenantId: number): Promise<Array<Partial<Item>>> => {
    try {
      return await context.models.Item.findAll({
        attributes: ["id", "name", "description", "createdOn", "updatedOn", `netAmount`, "unit", "manufacturer", "category"],
        where: { tenantId },
        order: [["name", "ASC"]]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getItem = async (context: Context, tenantId: number, id: number): Promise<Partial<Item> | null> => {
    try {
      return await context.models.Item.findOne({
        where: { tenantId, id }
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const createItem = async (context: Context, tenantId: number, createdBy: number, data: CreateItemProperties): Promise<Partial<Item> | null> => {
    try {
      return await context.models.Item.create({ ...data, tenantId, createdBy });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const updateItem = async (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Item>): Promise<Partial<Item> | null> => {
    try {
      const item = await context.models.Item.findOne({
        where: { tenantId, id }
      });

      if (!item) {
        return null;
      }

      await item.update({ ...data, updatedBy });

      return item;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteItem = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    try {
      await context.models.Item.destroy({ where: { id, tenantId } });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteItems = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    try {
      await context.models.Item.destroy({ where: { id: { [Op.in]: body.ids }, tenantId } });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    deleteItems
  };
};

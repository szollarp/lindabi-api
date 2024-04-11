import { Op } from "sequelize";
import type { Context } from "../types";
import type { Location, CreateLocationProperties } from "../models/interfaces/location";

export interface LocationService {
  getLocations: (context: Context, tenantId: number) => Promise<Array<Partial<Location>>>
  getLocation: (context: Context, tenantId: number, id: number) => Promise<Partial<Location> | null>
  createLocation: (context: Context, tenantId: number, createdBy: number, body: CreateLocationProperties) => Promise<Partial<Location> | null>
  updateLocation: (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Location>) => Promise<Partial<Location> | null>
  deleteLocation: (context: Context, tenantId: number, id: number) => Promise<{ success: boolean }>
  deleteLocations: (context: Context, tenantId: number, body: { ids: number[] }) => Promise<{ success: boolean }>
}

export const locationService = (): LocationService => {
  const getLocations = async (context: Context, tenantId: number): Promise<Array<Partial<Location>>> => {
    return await context.models.Location.findAll({
      attributes: ["id", "name", "country", "region", "city", "address", "zipCode", "status", "notes"],
      where: { tenantId }
    });
  };

  const getLocation = async (context: Context, tenantId: number, id: number): Promise<Partial<Location> | null> => {
    return await context.models.Location.findOne({
      attributes: ["id", "name", "country", "region", "city", "address", "zipCode", "status", "notes"],
      where: { tenantId, id }
    });
  };

  const createLocation = async (context: Context, tenantId: number, createdBy: number, data: CreateLocationProperties): Promise<Partial<Location> | null> => {
    try {
      return await context.models.Location.create({ ...data, tenantId, createdBy });
    } catch (error) {
      console.error(error);
    }
  };

  const updateLocation = async (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Location>): Promise<Partial<Location> | null> => {
    const location = await context.models.Location.findOne({
      where: { tenantId, id }
    });

    if (!location) {
      return null;
    }

    await location.update({ ...data, updatedBy });
    return location;
  };

  const deleteLocation = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    await context.models.Location.destroy({ where: { id, tenantId }, transaction: t, force: true });
    await t.commit();

    return { success: true };
  };

  const deleteLocations = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    await context.models.Location.destroy({ where: { id: { [Op.in]: body.ids }, tenantId }, transaction: t, force: true });
    await t.commit();

    return { success: true };
  };

  return {
    getLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    deleteLocations
  };
};

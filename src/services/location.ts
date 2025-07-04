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
  addToCompany: (context: Context, tenantId: number, id: number, body: { id: number }) => Promise<{ success: boolean }>
  removeFromCompany: (context: Context, tenantId: number, id: number, body: { id: number }) => Promise<{ success: boolean }>
}

export const locationService = (): LocationService => {
  const getLocations = async (context: Context, tenantId: number): Promise<Array<Partial<Location>>> => {
    try {
      return await context.models.Location.findAll({
        attributes: ["id", "name", "country", "region", "city", "address", "zipCode", "status", "notes", "taxNumber"],
        where: { tenantId },
        order: [["name", "ASC"]]
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const getLocation = async (context: Context, tenantId: number, id: number): Promise<Partial<Location> | null> => {
    try {
      return await context.models.Location.findOne({
        attributes: ["id", "name", "country", "region", "city", "address", "zipCode", "status", "notes", "taxNumber"],
        where: { tenantId, id }
      });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const createLocation = async (context: Context, tenantId: number, createdBy: number, data: CreateLocationProperties): Promise<Partial<Location> | null> => {
    try {
      return await context.models.Location.create({ ...data, tenantId, createdBy });
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const updateLocation = async (context: Context, tenantId: number, id: number, updatedBy: number, data: Partial<Location>): Promise<Partial<Location> | null> => {
    try {
      const location = await context.models.Location.findOne({
        where: { tenantId, id }
      });

      if (!location) {
        return null;
      }

      await location.update({ ...data, updatedBy });
      return location;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteLocation = async (context: Context, tenantId: number, id: number): Promise<{ success: boolean }> => {
    try {
      await context.models.Location.destroy({ where: { id, tenantId }, force: true });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const deleteLocations = async (context: Context, tenantId: number, body: { ids: number[] }): Promise<{ success: boolean }> => {
    try {
      await context.models.Location.destroy({ where: { id: { [Op.in]: body.ids }, tenantId }, force: true });
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const addToCompany = async (context: Context, tenantId: number, id: number, body: { id: number }): Promise<{ success: boolean }> => {
    try {
      const location = await context.models.Location.findOne({
        where: { tenantId, id }
      });

      if (!location) {
        return { success: false };
      }

      const company = await context.models.Company.findOne({
        where: { tenantId, id: body.id }
      });

      if (!company) {
        return { success: false };
      }

      await company.addLocation(location);
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const removeFromCompany = async (context: Context, tenantId: number, id: number, body: { id: number }): Promise<{ success: boolean }> => {
    try {
      const location = await context.models.Location.findOne({
        where: { tenantId, id }
      });

      if (!location) {
        return { success: false };
      }

      const company = await context.models.Company.findOne({
        where: { tenantId, id: body.id }
      });

      if (!company) {
        return { success: false };
      }

      await company.removeLocation(location);
      return { success: true };
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  return {
    getLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    deleteLocations,
    addToCompany,
    removeFromCompany
  };
};

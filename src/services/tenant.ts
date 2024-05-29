import { Op } from "sequelize";
import type { Context } from "../types";
import type { CreateTenantProperties, Tenant } from "../models/interfaces/tenant";
import { TenantModel } from "../models/tenant";

export interface TenantService {
  getTenants: (context: Context) => Promise<Array<Partial<Tenant>>>
  getTenant: (context: Context, id: number) => Promise<Partial<Tenant> | null>
  createTenant: (context: Context, data: CreateTenantProperties) => Promise<Partial<Tenant> | null>
  updateTenant: (context: Context, id: number, data: Partial<Tenant>) => Promise<Partial<Tenant> | null>
  deleteTenant: (context: Context, id: number) => Promise<{ success: boolean }>
  deleteTenants: (context: Context, body: { ids: number[] }) => Promise<{ success: boolean }>
}

export const tenantService = (): TenantService => {
  const getTenants = async (context: Context): Promise<Array<Partial<Tenant>>> => {
    const tenants = await context.models.Tenant.findAll({
      attributes: ["id", "name", "status", "taxNumber", "registrationNumber"],
      include: [{
        model: context.models.Image,
        attributes: ["image", "mimeType", "type"],
        as: "images",
        foreignKey: "ownerId"
      }, {
        model: context.models.Subscription,
        attributes: ["id", "name", "dateStart", "dateEnd"],
        as: "subscriptions"
      }]
    });

    return tenants;
  };

  const getTenant = async (context: Context, id: number): Promise<Partial<Tenant> | null> => {
    return await context.models.Tenant.findByPk(id, {
      attributes: ["id", "name", "status", "taxNumber", "email", "country", "region", "city", "address", "zipCode", "registrationNumber", "bankAccount"],
      include: [{
        model: context.models.Image,
        attributes: ["image", "mimeType", "type"],
        as: "images",
        foreignKey: "ownerId"
      }, {
        model: context.models.Subscription,
        attributes: ["id", "name", "dateStart", "dateEnd"],
        as: "subscriptions"
      }]
    });
  };

  const createTenant = async (context: Context, data: CreateTenantProperties): Promise<Partial<Tenant> | null> => {
    const dateStart = new Date();
    const dateEnd = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    const t = await context.models.sequelize.transaction();

    try {
      const tenant = await context.models.Tenant.create(data, { transaction: t });
      await context.models.Subscription.create({
        name: "Master data", dateStart, dateEnd, tenantId: tenant.id
      }, { transaction: t });

      await context.models.Subscription.create({
        name: "Tender", dateStart, dateEnd, tenantId: tenant.id
      }, { transaction: t });

      await t.commit();
      return tenant;
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  const updateTenant = async (context: Context, id: number, data: Partial<Tenant>): Promise<Partial<Tenant> | null> => {
    const tenant = await context.models.Tenant.findByPk(id);

    if (!tenant) {
      return null;
    }

    await tenant.update(data);

    return tenant;
  };

  const deleteTenant = async (context: Context, id: number): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      await context.models.Tenant.destroy({ where: { id }, transaction: t, force: true });
      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  const deleteTenants = async (context: Context, body: { ids: number[] }): Promise<{ success: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      await context.models.Tenant.destroy({ where: { id: { [Op.in]: body.ids } }, transaction: t, force: true });
      await t.commit();

      return { success: true };
    } catch (error) {
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  return {
    getTenants,
    getTenant,
    createTenant,
    updateTenant,
    deleteTenant,
    deleteTenants
  };
};

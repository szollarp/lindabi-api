import { Context, DecodedUser } from "../types";
import { CreateFinancialSettingProperties, FinancialSetting } from "../models/interfaces/financial-setting";

export interface FinancialSettingsService {
  list: (context: Context, user: DecodedUser) => Promise<FinancialSetting[]>
  add: (context: Context, user: DecodedUser, data: { type: string, items: CreateFinancialSettingProperties[] }) => Promise<FinancialSetting[]>
  remove: (context: Context, user: DecodedUser, id: number) => Promise<void>
}

export const financialSettingsService = (): FinancialSettingsService => ({
  list, add, remove
});

const list = async (context: Context, user: DecodedUser): Promise<FinancialSetting[]> => {
  try {
    return await context.models.FinancialSetting.findAll({
      where: { tenantId: user.tenant }
    });
  } catch (error) {
    throw error;
  }
};

const add = async (context: Context, user: DecodedUser, data: { type: string, items: CreateFinancialSettingProperties[] }): Promise<FinancialSetting[]> => {
  try {
    await context.models.FinancialSetting.destroy({
      where: { type: data.type, tenantId: user.tenant }
    });

    const body = data.items.map((item) => ({ ...item, tenantId: user.tenant, createdBy: user.id }));
    return await context.models.FinancialSetting.bulkCreate(body);
  } catch (error) {
    console.error(error);
    console.error(error.stack);
    throw error;
  }
};

const remove = async (context: Context, user: DecodedUser, id: number): Promise<void> => {
  try {
    await context.models.FinancialSetting.destroy({
      where: { id, tenantId: user.tenant }
    });
  } catch (error) {
    throw error;
  }
};

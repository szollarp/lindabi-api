import { FINANCIAL_SETTING_TYPE } from "../../constants";
import { Tenant } from "./tenant";
import type { User } from "./user";

export interface FinancialSetting {
  id?: number
  type: FINANCIAL_SETTING_TYPE
  //
  startDate: Date;
  endDate?: Date | null;
  amount?: number | null;
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
};

export type CreateFinancialSettingProperties = Omit<FinancialSetting, "id" | "createdOn" | "updatedBy" | "updatedOn">;

import { type Company } from "./company";
import { type Invoice } from "./invoice";
import { type Tenant } from "./tenant";
import { type User } from "./user";

export interface FinancialTransaction {
  id?: number
  //
  date: Date;
  amount: number;
  description: string;
  //
  recipientId?: number | null;
  recipient?: User;
  recipientType: "employee" | "cash desk";
  //
  payerId?: number | null;
  payer?: User;
  payerType: "employee" | "cash desk";
  //
  contractorId: Company["id"];
  contractor?: Company;
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant | null
  //
  invoiceId?: Invoice["id"] | null
  invoice?: Invoice | null
}

export type CreateFinancialTransactionProperties = Omit<FinancialTransaction, "id" | "createdOn">;

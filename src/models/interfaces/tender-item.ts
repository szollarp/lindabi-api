import { Tender } from "./tender"
import { User } from "./user"

export interface TenderItem {
  id: number
  //
  name: string
  num: number
  quantity: number
  unit: string
  materialNetUnitAmount: number
  materialNetAmount: number
  feeNetUnitAmount: number
  feeNetAmount: number
  //
  tenderId: Tender["id"]
  tender?: Tender | null
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
  //
  netAmount?: number | null
  vatAmount?: number | null
};

export type CreateTenderItemProperties = Omit<TenderItem, "id" | "num" | "createdOn" | "updatedBy" | "updatedOn">;
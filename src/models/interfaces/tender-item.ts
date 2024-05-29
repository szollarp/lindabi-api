import { TENDER_CURRENCY } from "../../constants"

export interface TenderItem {
  id: number
  tenderId: number
  name: string
  quantity: number
  unit: string
  vatKey: string
  currency: string
  surcharge?: number | null
  discount?: number | null
  materialNetUnitAmount: number
  materialNetAmount: number
  materialAmount: number
  feeNetUnitAmount: number
  feeNetAmount: number
  feeAmount: number
  totalMaterialNetAmount: number
  totalFeeNetAmount: number
  totalNetAmount: number
  totalAmount: number
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateTenderItemProperties = Omit<TenderItem, "id" | "createdOn" | "createdBy" | "updatedBy" | "updatedOn">;
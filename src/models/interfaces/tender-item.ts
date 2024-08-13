import { TENDER_CURRENCY } from "../../constants"

export interface TenderItem {
  id: number
  name: string
  quantity: number
  unit: string
  materialNetUnitAmount: number
  materialNetAmount: number
  materialActualNetAmount: number
  totalMaterialAmount: number
  feeNetUnitAmount: number
  feeNetAmount: number
  feeActualNetAmount: number
  totalFeeAmount: number
  tenderId: number
  num: number
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateTenderItemProperties = Omit<TenderItem, "id" | "num" | "createdOn" | "updatedBy" | "updatedOn">;
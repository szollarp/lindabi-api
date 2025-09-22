import { Tenant } from "./tenant";
import { TenderItem } from "./tender-item";

export interface TenderItemsSearch {
  id: number;
  tenderItemId: TenderItem["id"];
  tenantId: Tenant["id"];
  active: boolean;
  name: string;
  normalizedName: string;
  unit?: string | null;
  defaultPriceNet?: number | null;
  currency?: string | null;
  vatRate?: number | null;
  usageCount: number;
  lastUsedAt?: Date | null;
  aliasNames: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTenderItemsSearchProperties = Omit<TenderItemsSearch, "id" | "createdAt" | "updatedAt">;

export interface TenderItemsSearchSearchParams {
  query: string;
  limit?: number;
  offset?: number;
  tenantId: number;
}

export interface TenderItemsSearchResult {
  id: number;
  tenderItemId: number;
  name: string;
  unit?: string | null;
  defaultPriceNet?: number | null;
  currency?: string | null;
  vatRate?: number | null;
  usageCount: number;
  lastUsedAt?: Date | null;
  aliasNames: string[];
  tags: string[];
  similarity?: number;
  rank?: number;
}

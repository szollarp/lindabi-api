import { Item } from "./item";
import { Warehouse } from "./warehouse";
import { Project } from "./project";
import { ItemMovement } from "./item-movement";

export interface StockItem {
  itemId: number;
  item: Item;
  currentStock: number;
  totalIssued: number;
  totalReturned: number;
  totalTransferredIn: number;
  totalTransferredOut: number;
  lastTransactionDate?: Date;
}

export interface StockReport {
  entityType: 'warehouse' | 'project';
  entityId: number;
  entity: Warehouse | Project;
  items: StockItem[];
  transactions: ItemMovement[];
  totalItems: number;
  totalValue?: number;
  lastUpdated: Date;
}

export interface StockFilters {
  keyword: string;
  showZeroStock: boolean;
  sortBy: 'itemName' | 'currentStock' | 'lastTransaction';
  sortOrder: 'asc' | 'desc';
}

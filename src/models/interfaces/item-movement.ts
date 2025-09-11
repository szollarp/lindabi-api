import { Project } from "./project";
import { Tenant } from "./tenant";
import { User } from "./user";
import { Warehouse } from "./warehouse";
import { Item } from "./item";

export interface ItemMovement {
  id: number;
  type: 'issue' | 'return' | 'transfer';
  itemId: number;
  quantity: number;
  employeeId?: User["id"]; // Employee who performed the transaction
  //
  source?: 'warehouse' | 'project';
  sourceId?: Warehouse["id"] | Project["id"];
  target?: 'warehouse' | 'project';
  targetId?: Warehouse["id"] | Project["id"];
  tenantId?: Tenant["id"];
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
  // Related entities
  item?: Item;
  employee?: User;
  sourceWarehouse?: Warehouse;
  sourceProject?: Project;
  targetWarehouse?: Warehouse;
  targetProject?: Project;
}

export interface ItemMovementItem {
  itemId: number;
  quantity: number;
}

export interface CreateItemMovementProperties {
  type: 'issue' | 'return' | 'transfer';
  employeeId?: User["id"];
  source?: 'warehouse' | 'project';
  sourceId?: Warehouse["id"] | Project["id"];
  target?: 'warehouse' | 'project';
  targetId?: Warehouse["id"] | Project["id"];
  items: ItemMovementItem[];
}

export type UpdateItemMovementProperties = Partial<Omit<ItemMovement, "id" | "createdOn" | "updatedOn" | "createdBy" | "item" | "employee" | "sourceWarehouse" | "sourceProject" | "targetWarehouse" | "targetProject">>;
import { Project } from "./project";
import { Tenant } from "./tenant";
import { User } from "./user";
import { Warehouse } from "./warehouse";

export interface ItemMovement {
  id: number;
  type: 'issue' | 'return' | 'transfer';
  itemId: number;
  quantity: number;
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
}

export type CreateItemMovementProperties = Omit<ItemMovement, "id" | "createdOn" | "updatedBy" | "updatedOn">;
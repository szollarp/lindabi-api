import type { PROJECT_STATUS } from "../../constants"
import type { Company } from "./company"
import type { Contact } from "./contact"
import type { Location } from "./location"
import type { ProjectItem } from "./project-item"
import type { Document } from "./document";
import type { Tenant } from "./tenant"
import type { Tender } from "./tender"
import type { Milestone } from "./milestone"
import type { User } from "./user"
import type { TrackingEvent } from "./tracking-event"

export interface Project {
  id: number
  //
  number: string;
  name?: string | null;
  shortName?: string | null;
  inSchedule: boolean;
  scheduleColor?: string | null;
  type: string
  reports: boolean
  supervisorBonus: boolean
  notes?: string | null
  vatKey: string;
  netAmount: number;
  vatAmount: number;
  status: PROJECT_STATUS
  startDate?: Date | null
  endDate?: Date | null
  dueDate?: Date | null
  inquiry?: string | null
  survey?: string | null
  locationDescription?: string | null
  toolRequirements?: string | null
  otherComment?: string | null
  contractOption?: string | null
  //
  supervisorIds?: User["id"][] | null
  supervisors?: User[]
  //
  customerId?: Company["id"] | null
  customer?: Company
  //
  contractorId?: Company["id"] | null
  contractor?: Company
  //
  locationId?: Location["id"] | null
  location?: Location
  //
  contactIds?: Contact["id"][] | null
  contacts?: Contact[]
  //
  tenantId?: Tenant["id"] | null
  tenant?: Tenant
  //
  tenderId?: Tender["id"] | null;
  tender?: Tender;
  //
  itemsIds?: ProjectItem["id"][] | null
  items?: ProjectItem[]
  //
  documentIds?: Document["id"][] | null
  documents?: Document[]
  //
  milestoneIds?: Milestone["id"][] | null
  milestones?: Milestone[]
  //
  trackingEvents?: TrackingEvent[]
  //
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: User["id"]
  updatedBy?: User["id"] | null
  //
  itemsNetAmount?: number
  itemsVatAmount?: number
  itemsTotalAmount?: number
};

export type CreateProjectProperties = Omit<Project, "id" | "createdOn" | "updatedBy" | "updatedOn">;
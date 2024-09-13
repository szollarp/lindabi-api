import { PROJECT_STATUS } from "../../constants"
import type { Company } from "./company"
import type { Contact } from "./contact"
import type { Location } from "./location"
import type { ProjectItem } from "./project-item"
import type { Document } from "./document";
import { Tenant } from "./tenant"
import { Tender } from "./tender"
import { Milestone } from "./milestone"

export interface Project {
  id: number
  number: string;
  name?: string | null;
  shortName?: string | null;
  inSchedule: boolean;
  scheduleColor?: string | null;
  type: string
  reports: boolean
  supervisorBonus: boolean
  supervisorIds?: number[] | null
  customerId?: number | null
  customer?: Company
  contractorId?: number | null
  contractor?: Company
  locationId?: number | null
  location?: Location
  contactIds?: number[] | null
  contacts?: Contact[]
  supervisors?: Contact[]
  tenant?: Tenant
  tenantId?: number | null
  notes?: string | null
  vatKey: string;
  netAmount: number;
  vatAmount: number;
  tender?: Tender;
  tenderId?: number;
  status: PROJECT_STATUS
  startDate?: Date | null
  dueDate?: Date | null
  inquiry?: string | null
  survey?: string | null
  locationDescription?: string | null
  toolRequirements?: string | null
  otherComment?: string | null
  contractOption?: string | null
  items?: ProjectItem[]
  documents?: Document[]
  milestones?: Milestone[]
  createdOn?: Date
  updatedOn?: Date | null
  createdBy?: number
  updatedBy?: number | null
};

export type CreateProjectProperties = Omit<Project, "id" | "createdOn" | "updatedBy" | "updatedOn">;

export interface CreateProjectBody {
  documents?: Array<Document>;
  tenderId: number;
  uploadOption: "upload" | "later" | "skip";
};
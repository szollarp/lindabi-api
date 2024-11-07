import type { Company } from "./company";

export type DocumentOwnerType = "user" | "tenant" | "contact" | "company" | "tender" | "project" | "milestone" | "report" | "execution" | "invoice" | null;

export type DocumentType = "logo" | "stamp" | "signature" | "avatar" | "survey" | "other" |
  "plan" | "pdf" | "employee" | "medical-fitness-certificate" | "work-authorization-document" |
  "personal-protective-equipment-inspection-report" | "annual-subcontractor-framework-agreement" |
  "annual-general-occupational-safety-training" | "data-processing-declaration" | "tig" | "invoice" | "before" | "during" | "completion" | "inspection" | "contract" | "invoice";

export interface DocumentProperties {
  startOfValidity?: string;
  endOfValidity?: string;
};

export interface Document {
  id?: number
  //
  name?: string | null
  type: DocumentType;
  mimeType: string
  approved?: boolean
  //
  ownerId?: number | null
  ownerType?: DocumentOwnerType
  //
  properties?: DocumentProperties;
  //
  companyId?: Company["id"] | string | null
  company?: Company | null
  //
  stored?: {
    original: string
    resized?: string
    thumbnail?: string
  }
  //
  createdOn?: Date
  updatedOn?: Date | null
};

export type CreateDocumentProperties = Omit<Document, "id" | "createdOn" | "updatedOn">;
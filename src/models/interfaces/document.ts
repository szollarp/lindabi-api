export type DocumentOwnerType = "user" | "tenant" | "contact" | "company" | "tender" | "project" | "milestone" | "report" | "execution" | null;

export type DocumentType = "logo" | "stamp" | "signature" | "avatar" | "survey" | "other" |
  "plan" | "pdf" | "employee" | "medical-fitness-certificate" | "work-authorization-document" |
  "personal-protective-equipment-inspection-report" | "annual-subcontractor-framework-agreement" |
  "annual-general-occupational-safety-training" | "data-processing-declaration" | "tig" | "invoice" | "before" | "during" | "completion" | "inspection" | "contract";

export interface DocumentProperties {
  startOfValidity?: string;
  endOfValidity?: string;
};

export interface Document {
  id?: number
  name?: string | null
  type: DocumentType;
  ownerId?: number | null
  ownerType?: DocumentOwnerType
  mimeType: string
  createdOn?: Date
  updatedOn?: Date | null
  properties?: DocumentProperties;
  companyId?: number | string | null
  approved?: boolean
  stored?: {
    original: string
    resized?: string
    thumbnail?: string
  }
};

export type CreateDocumentProperties = Omit<Document, "id" | "createdOn" | "updatedOn">;
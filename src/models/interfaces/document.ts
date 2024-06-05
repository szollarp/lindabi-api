export type DocumentOwnerType = "user" | "tenant" | "contact" | "company" | "tender" | null;

export type DocumentType = "logo" | "stamp" | "signature" | "avatar" | "survey" | "other" | "plan" | "pdf";

export interface Document {
  id?: number
  name?: string | null
  preview?: string | null
  type: DocumentType;
  ownerId?: number | null
  ownerType?: DocumentOwnerType
  data: string
  mimeType: string
  size?: number | null
  createdOn?: Date
  updatedOn?: Date | null
}

export type CreateDocumentProperties = Omit<Document, "id" | "createdOn" | "updatedOn">;
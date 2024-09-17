import { COMPANY_TYPE } from "../constants";
import { isEmployeeDocumentInvalid } from "../helpers/document";
import { CreateDocumentProperties, Document, DocumentOwnerType } from "../models/interfaces/document";
import type { Context } from "../types";

export const MAIN_DOCUMENTS = [
  "medical-fitness-certificate",
  "work-authorization-document",
  "personal-protective-equipment-inspection-report",
];

export const COMPANY_DOCUMENTS = [
  "annual-subcontractor-framework-agreement",
  "annual-general-occupational-safety-training",
  "data-processing-declaration",
];

export interface DocumentService {
  upload: (context: Context, id: number, body: CreateDocumentProperties, ownerType: DocumentOwnerType, unique: boolean) => Promise<{ uploaded: boolean }>
  get: (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType) => Promise<Partial<Document> | null>
  remove: (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType) => Promise<{ removed: boolean }>
  update: (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType, data: Partial<Document>) => Promise<Document>
  checkUserDocuments: (context: Context, tenantId: number, id: number) => void
}

export const documentService = (): DocumentService => {
  return {
    upload,
    get,
    remove,
    update,
    checkUserDocuments,
  };
};

// Function to upload a document, optionally ensuring it's unique within the specified context.
async function upload(context: Context, id: number, body: CreateDocumentProperties, ownerType: DocumentOwnerType, unique: boolean = false): Promise<{ uploaded: boolean }> {
  const t = await context.models.sequelize.transaction();
  try {
    const { data, mimeType, type, name, companyId = null, approved = false, properties = {} } = body;
    if (!unique) {
      const [newDocument, created] = await context.models.Document.findOrCreate({
        where: { ownerId: id, ownerType, type },
        defaults: { properties, data, type, mimeType, ownerType, ownerId: id, name, companyId, approved },
        transaction: t
      });
      if (!created) {
        await newDocument.update({ data, mimeType, properties }, { transaction: t });
      }
    } else {
      await context.models.Document.create({ properties, data, type, mimeType, ownerType, ownerId: id, name, companyId, approved }, { transaction: t });
    }
    await t.commit();
    return { uploaded: true };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

// Function to retrieve a document by owner and document ID.
async function get(context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType): Promise<Partial<Document> | null> {
  try {
    return await context.models.Document.findOne({
      where: { ownerId, ownerType, id },
      attributes: ["id", "data", "mimeType", "name"],
    });
  } catch (error) {
    throw error;
  }
}

// Function to remove a specific document by owner and document ID.
async function remove(context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType): Promise<{ removed: boolean }> {
  try {
    const document = await context.models.Document.findOne({ where: { id, ownerType, ownerId } });
    if (document) {
      await document.destroy();
      return { removed: true };
    }
    return { removed: false };
  } catch (error) {
    throw error;
  }
}

// Function to update a specific document by owner and document ID.
async function update(context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType, data: Partial<Document>): Promise<Document> {
  try {
    const document = await context.models.Document.findOne({ where: { id, ownerType, ownerId } });
    if (!document) {
      throw new Error("Document not found");
    }
    await document.update(data);
    return document;
  } catch (error) {
    throw error;
  }
}

/**
 * Checks the validity of user documents based on predefined rules.
 */
async function checkUserDocuments(context: Context, tenantId: number, id: number) {
  try {
    const user = await context.services.user.get(context, tenantId, id);
    if (!user || !user.documents || !user.properties) {
      throw new Error("Documents not found");
    }

    let invalidDocuments = MAIN_DOCUMENTS.map(type => isEmployeeDocumentInvalid(type, user.documents, user.properties!));

    const contractors = await context.services.company.getCompanies(context, tenantId, COMPANY_TYPE.CONTRACTOR);
    contractors.forEach(contractor => {
      invalidDocuments = [...COMPANY_DOCUMENTS.map(type => isEmployeeDocumentInvalid(type, user.documents, user.properties!, contractor)), ...invalidDocuments];
    });

    return invalidDocuments.filter(n => n);
  } catch (error) {
    context.logger.error(error);
    throw error;
  }
}
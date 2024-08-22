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
  remove: (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType) => Promise<{ removed: boolean }>
  update: (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType, data: Partial<Document>) => Promise<Document>
  checkUserDocuments: (context: Context, tenantId: number, id: number) => void
}

export const documentService = (): DocumentService => {
  const upload = async (context: Context, id: number, body: CreateDocumentProperties, ownerType: DocumentOwnerType, unique: boolean = false): Promise<{ uploaded: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const companyId = body.companyId || null;
      const approved = body.approved || false;
      const { data, mimeType, type, name } = body;
      const properties = body?.properties || {};

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
        await context.models.Document.create({
          properties, data, type, mimeType, ownerType, ownerId: id, name, companyId, approved
        }, { transaction: t });
      }

      await t.commit();
      return { uploaded: true };
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  };

  const remove = async (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType): Promise<{ removed: boolean }> => {
    try {
      const document = await context.models.Document.findOne({ where: { id, ownerType, ownerId } });
      if (document) {
        await document.destroy();
        return { removed: true };
      }
    } catch (error) {
      context.logger.error(error);
      throw error;
    } finally {
      return { removed: false };
    }
  };

  const update = async (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType, data: Partial<Document>): Promise<Document> => {
    try {

      const document = await context.models.Document.findOne({ where: { id, ownerType, ownerId } });
      if (!document) {
        throw new Error("Document not found");
      }

      await document.update(data);

      return document;
    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  };

  const checkUserDocuments = async (context: Context, tenantId: number, id: number) => {
    try {
      const user = await context.services.user.get(context, tenantId, id);
      if (!user || !user.documents || !user.properties) {
        throw new Error("Documents not found");
      }

      const { documents, properties } = user;
      let invalidDocuments = MAIN_DOCUMENTS.map(type => isEmployeeDocumentInvalid(type, documents, properties));

      const contractors = await context.services.company.getCompanies(context, tenantId, COMPANY_TYPE.CONTRACTOR);
      contractors.forEach(contractor => {
        invalidDocuments = [
          ...COMPANY_DOCUMENTS.map(type => isEmployeeDocumentInvalid(type, documents, properties, contractor)),
          ...invalidDocuments
        ]
      });

      return invalidDocuments.filter(n => n);

    } catch (error) {
      context.logger.error(error);
      throw error;
    }
  }

  return { upload, remove, update, checkUserDocuments };
};

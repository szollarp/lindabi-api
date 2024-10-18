import path from "path";
import sharp from 'sharp';
import { COMPANY_TYPE } from "../constants";
import { isEmployeeDocumentInvalid } from "../helpers/document";
import { Document, DocumentOwnerType, DocumentProperties, DocumentType } from "../models/interfaces/document";
import type { Context, DecodedUser } from "../types";
import { AzureStorageService } from "../helpers/azure-storage";

type FitEnum = "inside" | "outside" | "cover" | "contain";

type ImageSizes = {
  resized: { fit: FitEnum, width: number },
  thumbnail: { fit: FitEnum, width: number }
};

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

type DocumentUploadProperties = DocumentProperties & {
  approved?: boolean
};

export interface DocumentService {
  upload(context: Context, user: DecodedUser, ownerId: number, ownerType: DocumentOwnerType, type: DocumentType, files: Express.Multer.File[], properties: DocumentUploadProperties, unique?: boolean): Promise<{ uploaded: boolean }>
  getDocument: (context: Context, id: number, ownerId: number, ownerType: DocumentOwnerType) => Promise<any>
  getDocuments: (context: Context, ownerId: number, ownerType: DocumentOwnerType) => Promise<any>
  removeDocument: (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType) => Promise<{ removed: boolean }>
  removeDocuments: (context: Context, ownerId: number, ownerType: DocumentOwnerType, type: DocumentType) => Promise<{ removed: boolean }>
  update: (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType, data: Partial<Document>) => Promise<Document>
  checkUserDocuments: (context: Context, tenantId: number, id: number) => void
}

export const documentService = (): DocumentService => {
  return {
    upload,
    getDocument,
    getDocuments,
    removeDocument,
    removeDocuments,
    update,
    checkUserDocuments,
  };
};

// Function to upload a document, optionally ensuring it's unique within the specified context.
async function upload(context: Context, user: DecodedUser, ownerId: number, ownerType: DocumentOwnerType, type: DocumentType, files: Express.Multer.File[], properties: DocumentUploadProperties = {}, unique: boolean = false): Promise<{ uploaded: boolean }> {
  if (!files || files.length === 0) {
    throw new Error("Documents not found on the request");
  }

  const t = await context.models.sequelize.transaction();

  try {
    const azureStorage = new AzureStorageService(context.config.get("azure.storage"));

    const uploadPromises = files.map(async (file) => {
      const originalBuffer = file.buffer;
      const mimeType = file.mimetype;
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension);
      const timestamp = Date.now();

      if (unique) {
        const existing = await context.models.Document.findOne({
          where: { ownerId, ownerType, type }
        });

        await existing?.destroy();
      }

      const approved = properties?.approved ?? false;
      const name = `${baseName}_${timestamp}${extension}`;
      const document = await context.models.Document.create({
        ownerId, ownerType, name, mimeType, type, properties, approved
      }, { transaction: t });

      await azureStorage.uploadBlob(originalBuffer, name, mimeType);
      const originalKey = await azureStorage.generateSasUrl(name);

      await context.services.journey.addSimpleLog(context, user, {
        activity: `Document have been successfully uploaded.`,
        property: `Document`,
        updated: document.name
      }, ownerId, ownerType as string);

      if (mimeType.startsWith('image/')) {
        const { sizes }: { sizes: ImageSizes } = context.config.get("upload.image");

        const resizedBuffer = await sharp(originalBuffer)
          .resize({ fit: sizes.resized.fit, width: sizes.resized.width })
          .toBuffer();

        const thumbnailBuffer = await sharp(originalBuffer)
          .resize({ fit: sizes.thumbnail.fit, width: sizes.thumbnail.width })
          .toBuffer();

        const resizedBlob = `resized/${name}`;
        const thumbnailBlob = `thumbnail/${name}`;

        await Promise.all([
          azureStorage.uploadBlob(resizedBuffer, resizedBlob, mimeType),
          azureStorage.uploadBlob(thumbnailBuffer, thumbnailBlob, mimeType),
        ]);

        const [resizedKey, thumbnailKey] = await Promise.all([
          azureStorage.generateSasUrl(resizedBlob),
          azureStorage.generateSasUrl(thumbnailBlob),
        ]);

        return { originalKey, resizedKey, thumbnailKey };
      }

      return { originalKey };
    });

    await Promise.all(uploadPromises);
    await t.commit();

    return { uploaded: true };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

// Function to retrieve a document by owner and document ID.
async function getDocument(context: Context, id: number, ownerId: number, ownerType: DocumentOwnerType): Promise<Document | null> {
  try {
    return await context.models.Document.findOne({
      where: { ownerId, ownerType, id },
      attributes: ["id", "name", "mimeType", "type", "stored"]
    });
  } catch (error) {
    throw error;
  }
}

// Function to retrieve a document by owner and document ID.
async function getDocuments(context: Context, ownerId: number, ownerType: DocumentOwnerType): Promise<Document[] | null> {
  try {
    return await context.models.Document.findAll({
      where: { ownerId, ownerType },
      attributes: ["id", "name", "mimeType", "type", "stored"]
    });
  } catch (error) {
    throw error;
  }
}

// Function to remove a specific document by owner and document ID.
async function removeDocument(context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType): Promise<{ removed: boolean }> {
  try {
    const azureStorage = new AzureStorageService(context.config.get("azure.storage"));

    const document = await context.models.Document.findOne({
      attributes: ["id", "name", "mimeType", "type", "stored"],
      where: {
        id, ownerType, ownerId
      }
    });

    if (!document) {
      throw new Error("Document not found");
    }

    await document.destroy();
    await azureStorage.removeBlob(document.name!);

    if (document.mimeType.startsWith('image/')) {
      await azureStorage.removeBlob(`resized/${document.name!}`);
      await azureStorage.removeBlob(`thumbnail/${document.name!}`);
    }

    return { removed: true };
  } catch (error) {
    throw error;
  }
}

async function removeDocuments(context: Context, ownerId: number, ownerType: DocumentOwnerType, type: DocumentType): Promise<any> {
  try {
    const azureStorage = new AzureStorageService(context.config.get("azure.storage"));

    const documents = await context.models.Document.findAll({
      where: { ownerId, ownerType, type },
      attributes: ["id", "name", "mimeType", "type", "stored"],
    });

    if (!documents) {
      throw new Error("Documents not found");
    }

    const promises = documents.map(async (document) => {
      await document.destroy();
      await azureStorage.removeBlob(document.name!);

      if (document.mimeType.startsWith('image/')) {
        await azureStorage.removeBlob(`resized/${document.name!}`);
        await azureStorage.removeBlob(`thumbnail/${document.name!}`);
      }
    });

    await Promise.all(promises);
    return { removed: true };
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
export async function checkUserDocuments(context: Context, tenantId: number, id: number) {
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
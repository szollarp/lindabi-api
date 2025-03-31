import path from "path";
import fs from "fs";
import sharp from 'sharp';
import mime from 'mime-types';
import { COMPANY_TYPE } from "../constants";
import { isEmployeeDocumentInvalid } from "../helpers/document";
import { Document, DocumentOwnerType, DocumentProperties, DocumentType } from "../models/interfaces/document";
import type { Context, ContextualRequest, DecodedUser } from "../types";
import { AzureStorageService } from "../helpers/azure-storage";

const CHUNK_DIR = "tmp/chunks";

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
  merge(context: Context, user: DecodedUser, tmpPath: string, chunkSize: number, ownerId: number, ownerType: DocumentOwnerType, type: DocumentType, properties: DocumentUploadProperties, unique?: boolean): Promise<Document>
  getDocument: (context: Context, id: number, ownerId: number, ownerType: DocumentOwnerType) => Promise<any>
  getDocuments: (context: Context, ownerId: number, ownerType: DocumentOwnerType) => Promise<any>
  removeDocument: (context: Context, id: number) => Promise<{ removed: boolean }>
  removeDocuments: (context: Context, ownerId: number, ownerType: DocumentOwnerType, type: DocumentType) => Promise<{ removed: boolean }>
  update: (context: Context, ownerId: number, id: number, ownerType: DocumentOwnerType, data: Partial<Document>) => Promise<Document>
  checkUserDocuments: (context: Context, tenantId: number, id: number) => void
}

export const documentService = (): DocumentService => {
  return {
    upload,
    merge,
    getDocument,
    getDocuments,
    removeDocument,
    removeDocuments,
    update,
    checkUserDocuments,
  };
};

export const mergeDocumentChunks = async (fileName: string, chunkSize: number): Promise<Buffer> => {
  try {
    console.log("Merging document chunks", fileName, chunkSize);

    const mergedFilePath = path.join(CHUNK_DIR, fileName);
    const writeStream = fs.createWriteStream(mergedFilePath);

    for (let i = 1; i <= chunkSize; i++) {
      const chunkName = path.join(CHUNK_DIR, `${fileName}.part${i}`);

      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(chunkName);

        readStream.on("data", (chunk) => writeStream.write(chunk));
        readStream.on("end", async () => {
          await fs.promises.unlink(chunkName);
          resolve();
        });
        readStream.on("error", reject);
      });
    }

    await new Promise<void>((resolve) => writeStream.end(resolve));
    return fs.promises.readFile(mergedFilePath);
  } catch (e) {
    console.error("Error merging document chunks:", e);
    throw new Error("Documents not found on the request");
  }
};

const resizeImage = async (context: Context, imageName: string, mimeType: string, imageBuffer: Buffer, storage: AzureStorageService): Promise<{ resizedKey: string, thumbnailKey: string }> => {
  const { sizes }: { sizes: ImageSizes } = context.config.get("upload.image");

  const resizedBuffer = await sharp(imageBuffer)
    .resize({ fit: sizes.resized.fit, width: sizes.resized.width })
    .toBuffer();

  const thumbnailBuffer = await sharp(imageBuffer)
    .resize({ fit: sizes.thumbnail.fit, width: sizes.thumbnail.width })
    .toBuffer();

  const resizedBlob = `resized/${imageName}`;
  const thumbnailBlob = `thumbnail/${imageName}`;

  await Promise.all([
    storage.uploadBlob(resizedBuffer, resizedBlob, mimeType),
    storage.uploadBlob(thumbnailBuffer, thumbnailBlob, mimeType),
  ]);

  const [resizedKey, thumbnailKey] = await Promise.all([
    storage.generateSasUrl(resizedBlob),
    storage.generateSasUrl(thumbnailBlob),
  ]);

  return { resizedKey, thumbnailKey };
};

async function merge(context: Context, user: DecodedUser, fileName: string, chunkSize: number, ownerId: number, ownerType: DocumentOwnerType, type: DocumentType, properties: DocumentUploadProperties = {}, unique: boolean = false): Promise<Document> {
  if (!fileName) {
    throw new Error("Documents not found on the request");
  }

  const t = await context.models.sequelize.transaction();

  try {
    const buffer = await mergeDocumentChunks(fileName, chunkSize);
    const azureStorage = new AzureStorageService(context.config.get("azure.storage"));

    const mimeType = mime.lookup(fileName);
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
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

    await azureStorage.uploadBlob(buffer, name, mimeType);
    await azureStorage.generateSasUrl(name);

    await context.services.journey.addSimpleLog(context, user, {
      activity: `Document have been successfully uploaded.`,
      property: `Document`,
      updated: document.name
    }, ownerId, ownerType as string);

    if (mimeType.startsWith('image/')) {
      await resizeImage(context, name, mimeType, buffer, azureStorage);
    }

    await t.commit();
    return document;
  }
  catch (error) {
    await t.rollback();
    console.log(error);
    console.log(error.stack);
    throw error;
  }
}

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
async function removeDocument(context: Context, id: number): Promise<{ removed: boolean }> {
  try {
    const azureStorage = new AzureStorageService(context.config.get("azure.storage"));

    const document = await context.models.Document.findOne({
      attributes: ["id", "name", "mimeType", "type", "stored"],
      where: {
        id
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

    if (!user || !user.properties) {
      throw new Error("Documents not found");
    }

    console.log("properties", user.properties);

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
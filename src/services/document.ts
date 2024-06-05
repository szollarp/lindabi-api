import { CreateDocumentProperties, DocumentOwnerType } from "../models/interfaces/document";
import type { Context } from "../types";

export interface DocumentService {
  upload: (context: Context, id: number, body: CreateDocumentProperties, ownerType: DocumentOwnerType) => Promise<{ uploaded: boolean }>
}

export const documentService = (): DocumentService => {
  const upload = async (context: Context, id: number, body: CreateDocumentProperties, ownerType: DocumentOwnerType): Promise<{ uploaded: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const { data, mimeType, type } = body;
      const [newDocument, created] = await context.models.Document.findOrCreate({
        where: { ownerId: id, ownerType, type },
        defaults: { data, type, mimeType, ownerType, ownerId: id },
        transaction: t
      });

      if (!created) {
        await newDocument.update({ data, mimeType }, { transaction: t });
      }

      await t.commit();
      return { uploaded: true };
    } catch (error) {
      await t.rollback();
      context.logger.error(error);
      throw error;
    }
  };

  return { upload };
};

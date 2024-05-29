import { CreateImageProperties, ImageOwnerType } from "../models/interfaces/image";
import type { Context } from "../types";

export interface ImageService {
  upload: (context: Context, id: number, body: CreateImageProperties, ownerType: ImageOwnerType) => Promise<{ uploaded: boolean }>
}

export const imageService = (): ImageService => {
  const upload = async (context: Context, id: number, body: CreateImageProperties, ownerType: ImageOwnerType): Promise<{ uploaded: boolean }> => {
    const t = await context.models.sequelize.transaction();

    try {
      const { image, mimeType, type } = body;
      const [newImage, created] = await context.models.Image.findOrCreate({
        where: { ownerId: id, ownerType, type },
        defaults: { image, type, mimeType, ownerType, ownerId: id },
        transaction: t
      });

      if (!created) {
        await newImage.update({ image, mimeType }, { transaction: t });
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

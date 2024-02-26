import type { CreateProfilePictureProperties, ProfilePictureOwnerType } from "../models/interfaces/profile-picture";
import type { Context } from "../types";

export interface ProfilePictureService {
  upload: (context: Context, id: number, tenantId: number, body: CreateProfilePictureProperties, ownerType: ProfilePictureOwnerType) => Promise<{ uploaded: boolean }>
}

export const profilePictureService = (): ProfilePictureService => {
  const upload = async (context: Context, id: number, tenantId: number, body: CreateProfilePictureProperties, ownerType: ProfilePictureOwnerType): Promise<{ uploaded: boolean }> => {
    const t = await context.models.sequelize.transaction();
    const { image, mimeType } = body;

    try {
      const [picture, created] = await context.models.ProfilePicture.findOrCreate({
        where: { ownerId: id, ownerType },
        defaults: { image, mimeType, ownerType, ownerId: id },
        transaction: t
      });

      if (!created) {
        await picture.update({ image, mimeType }, { transaction: t });
      }

      await t.commit();

      return { uploaded: true };
    } catch (error) {
      console.error(error);
      await t.rollback();

      context.logger.error(error);
      throw error;
    }
  };

  return { upload };
};

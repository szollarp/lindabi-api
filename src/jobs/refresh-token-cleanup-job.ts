import { Op } from "sequelize";
import type { Context } from "../types";

/**
 * Job for cleaning up expired refresh tokens
 * 
 * Runs daily to remove expired refresh tokens from database
 * - Only removes tokens where expiresAt < now
 * - NULL expiresAt means no expiration (legacy tokens, not removed)
 * - Helps maintain database hygiene and security
 */
export interface RefreshTokenCleanupJob {
    cleanupExpiredTokens: (context: Context) => Promise<void>;
}

export const refreshTokenCleanupJob = (): RefreshTokenCleanupJob => {
    const cleanupExpiredTokens = async (context: Context): Promise<void> => {
        try {
            context.logger.info("Starting refresh token cleanup job");

            const now = new Date();

            // Find and delete expired tokens
            // Only delete tokens where expiresAt is NOT NULL and < now
            const deletedCount = await context.models.RefreshToken.destroy({
                where: {
                    expiresAt: {
                        [Op.not]: null,
                        [Op.lt]: now
                    }
                }
            });

            if (deletedCount > 0) {
                context.logger.info(`Refresh token cleanup: Deleted ${deletedCount} expired tokens`);
            } else {
                context.logger.info("Refresh token cleanup: No expired tokens found");
            }

            context.logger.info("Refresh token cleanup job completed successfully");
        } catch (error) {
            context.logger.error("Error in refresh token cleanup job:", error);
            throw error;
        }
    };

    return {
        cleanupExpiredTokens
    };
};
